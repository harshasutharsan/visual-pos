import React from 'react';
import { LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  unsyncedCount: number;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isOnline, 
  unsyncedCount, 
  onLogout,
  onOpenSettings
}) => {
  return (
    <header className="p-4 sm:p-6 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl sticky top-0 z-[100] border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg font-black text-xl italic leading-none">V</div>
        <div>
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white">VisualPOS</h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {isOnline ? (unsyncedCount > 0 ? `${unsyncedCount} Syncing` : 'System Online') : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenSettings} 
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 active:scale-90 transition-all"
        >
          <Settings size={20} />
        </button>
        <button 
          onClick={onLogout} 
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 active:scale-90 transition-all"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
