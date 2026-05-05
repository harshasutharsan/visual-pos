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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="space-y-6">
      {/* Revenue Card - High Visibility */}
      <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-800/50">
        <div className="relative z-10 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-100">Revenue Today</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter">LKR {revenue.toLocaleString()}</h2>
        </div>
        <div className="mt-6 flex items-center gap-2">
           <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
              {salesCount} Sales
           </div>
           <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 ${lowStockCount > 0 ? 'bg-amber-500/20 text-amber-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
              {lowStockCount} Low Stock
           </div>
        </div>
      </div>

      {/* Main Action Grid - Corporate Mobile Style */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('sales')} 
          className="h-[140px] bg-emerald-600 text-white flex flex-col justify-center items-center p-6 rounded-[32px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all border-b-4 border-emerald-800/50 space-y-3"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><ShoppingCart size={24} /></div>
          <span className="text-sm font-black uppercase tracking-widest">New Sale</span>
        </button>
        <button 
          onClick={() => onNavigate('history')} 
          className="h-[140px] bg-indigo-600 text-white flex flex-col justify-center items-center p-6 rounded-[32px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all border-b-4 border-indigo-800/50 space-y-3"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><History size={24} /></div>
          <span className="text-sm font-black uppercase tracking-widest">Reports</span>
        </button>
        <Card className="p-6 flex flex-col justify-between h-[140px] border-b-4 border-slate-200 dark:border-slate-800">
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inventory</span>
           <h3 className="text-2xl font-black tracking-tight">{lowStockCount} Alerts</h3>
           <button onClick={() => onNavigate('inventory')} className="text-indigo-600 text-[10px] font-black uppercase flex items-center gap-1">Manage <ChevronRight size={14}/></button>
        </Card>
        <Card className="p-6 flex flex-col justify-between h-[140px] border-b-4 border-slate-200 dark:border-slate-800">
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sync Status</span>
           <h3 className="text-2xl font-black tracking-tight text-emerald-500">Live</h3>
           <button className="text-slate-400 text-[10px] font-black uppercase flex items-center gap-1">Cloud Ready</button>
        </Card>
      </div>
    </motion.div>
  );
};
