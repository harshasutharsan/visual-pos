import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  unsyncedCount: number;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isOnline, 
  unsyncedCount, 
  darkMode, 
  setDarkMode, 
  onLogout 
}) => {
  return (
    <header className="p-6 flex items-center justify-between bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 border-b-2 border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-lg font-black text-2xl italic leading-none">V</div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white">VisualPOS</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isOnline ? (unsyncedCount > 0 ? `${unsyncedCount} Syncing` : 'System Ready') : 'Offline'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400"
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <button 
          onClick={onLogout} 
          className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400"
        >
          <LogOut size={24} />
        </button>
      </div>
    </header>
  );
};
