import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Edit3, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { db } from '../../services/database';

interface InventoryScreenProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (p: Product) => void;
  onManageCategories: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onManageCategories 
}) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between px-2">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Store Items</h2>
        <div className="flex gap-2">
          <button 
            onClick={onManageCategories} 
            className="flex-1 sm:flex-none bg-white dark:bg-slate-900 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest px-4 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2"
          >
            <Settings size={14}/> Categories
          </button>
          <button 
            onClick={onAddProduct} 
            className="flex-[2] sm:flex-none bg-indigo-600 text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Plus size={16}/> Add New Item
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 px-2">
        {products.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 flex items-center justify-between p-4 rounded-[28px] border-b-4 border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-400">{p.name[0]}</div>}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white truncate max-w-[140px]">{p.name}</h4>
                <p className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-fit ${p.stock <= p.minThreshold ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {p.stock} {p.unit}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onEditProduct(p)} 
                className="w-11 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 flex items-center justify-center border border-slate-100 dark:border-slate-700 active:bg-indigo-600 active:text-white transition-all"
              >
                <Edit3 size={18}/>
              </button>
              <button 
                onClick={async () => { if(confirm('Delete product?')) await db.products.delete(p.id!); }} 
                className="w-11 h-11 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 flex items-center justify-center border border-red-100 dark:border-red-900/30 active:bg-red-600 active:text-white transition-all"
              >
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
