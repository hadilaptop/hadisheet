import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface FABProps extends HTMLMotionProps<"button"> {
  icon?: React.ReactNode;
}

export function FAB({ className, icon, ...props }: FABProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "fixed bottom-6 end-6 w-14 h-14 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center z-50 hover:bg-amber-600 transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500/30",
        className
      )}
      {...props}
    >
      {icon || <Plus size={26} strokeWidth={2.5} />}
    </motion.button>
  );
}
