import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function Header({ title, onBack, rightAction, className }: HeaderProps) {
  return (
    <div className={cn("sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_10px_0_rgba(0,0,0,0.02)] pt-safe", className)}>
      <div className="flex items-center min-w-[3rem]">
        {onBack && (
          <button onClick={onBack} className="p-2 -me-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all rounded-full">
            <ArrowRight size={24} />
          </button>
        )}
      </div>
      <h1 className="text-lg font-bold text-slate-900 truncate px-2">{title}</h1>
      <div className="flex items-center justify-end min-w-[3rem]">
        {rightAction}
      </div>
    </div>
  );
}
