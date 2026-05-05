import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingCart, History } from 'lucide-react';
import { Card } from '../../components/UI';

interface DashboardProps {
  revenue: number;
  salesCount: number;
  lowStockCount: number;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ revenue, salesCount, lowStockCount, onNavigate }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-[240px] border-4 border-white/10">
          <div className="relative z-10 space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-100">Revenue Today</p>
            <h2 className="text-6xl font-black tracking-tighter">LKR {revenue.toLocaleString()}</h2>
          </div>
          <div className="relative z-10 w-fit">
            <span className="bg-white/20 px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase flex items-center gap-2 border border-white/20">
              <History size={16} /> {salesCount} Total Sales
            </span>
          </div>
        </div>
        
        <Card className="flex flex-col justify-between h-[240px]">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Stock Status</p>
            <h2 className={`text-5xl font-black tracking-tighter ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {lowStockCount} Low Stock
            </h2>
          </div>
          <button 
            onClick={() => onNavigate('inventory')} 
            className="text-sm font-black text-indigo-600 uppercase flex items-center gap-2 w-fit bg-indigo-50 dark:bg-indigo-950/50 px-6 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            Go to Inventory <ChevronRight size={18} />
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <button 
          onClick={() => onNavigate('sales')} 
          className="h-[180px] bg-emerald-600 text-white flex flex-col justify-center items-center p-8 rounded-[40px] shadow-2xl shadow-emerald-600/30 active:scale-95 transition-all border-b-8 border-emerald-800 space-y-4"
        >
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center shadow-lg"><ShoppingCart size={40} /></div>
          <span className="text-3xl font-black uppercase tracking-tighter">New Bill</span>
        </button>
        <button 
          onClick={() => onNavigate('history')} 
          className="h-[180px] bg-indigo-600 text-white flex flex-col justify-center items-center p-8 rounded-[40px] shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all border-b-8 border-indigo-800 space-y-4"
        >
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center shadow-lg"><History size={40} /></div>
          <span className="text-3xl font-black uppercase tracking-tighter text-center">Records</span>
        </button>
      </div>
    </motion.div>
  );
};
