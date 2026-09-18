import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  // ۲. رندر محتوای سنگین فرم با کمی تاخیر برای تضمین اجرای انیمیشن نرم ۶۰ فریم بدون افت فریم
  const [shouldRenderContent, setShouldRenderContent] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      // تاخیر جزئی (۴۰ میلی‌ثانیه) جهت جلوگیری از لگ رندر همزمان با آغاز انیمیشن transform
      timer = setTimeout(() => {
        setShouldRenderContent(true);
      }, 40);
    } else {
      setShouldRenderContent(false);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm will-change-[opacity]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 320,
              mass: 0.8
            }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] will-change-transform transform-gpu"
          >
            <div className="flex justify-center p-3">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>
            
            <div className="px-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 -me-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto overscroll-contain pb-safe">
              {shouldRenderContent ? (
                children
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
