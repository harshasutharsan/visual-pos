import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../components/UI';
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
      <div className="flex justify-between items-center px-2">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Store Items</h2>
        <div className="flex gap-3">
          <button 
            onClick={onManageCategories} 
            className="bg-slate-100 dark:bg-slate-800 h-14 rounded-3xl text-[10px] font-black uppercase tracking-widest px-6 border-2 border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm"
          >
            <Settings size={18}/> Categories
          </button>
          <Button onClick={onAddProduct} className="h-14 rounded-3xl text-xs px-8 shadow-indigo-500/20">
            <Plus size={18}/> Add Product
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 px-2">
        {products.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 flex items-center justify-between p-5 rounded-[32px] border-4 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-3xl">{p.name[0]}</div>}
              </div>
              <div>
                <h4 className="font-black text-lg uppercase tracking-tight leading-none text-slate-900 dark:text-white">{p.name}</h4>
                <p className={`text-[11px] font-black uppercase tracking-widest mt-2 px-4 py-1.5 rounded-xl w-fit ${p.stock <= p.minThreshold ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {p.stock} {p.unit} in Stock
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onEditProduct(p)} 
                className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <Edit3 size={24}/>
              </button>
              <button 
                onClick={async () => { if(confirm('Delete product?')) await db.products.delete(p.id!); }} 
                className="w-14 h-14 bg-red-50 dark:bg-red-950/20 rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border-2 border-red-100 dark:border-red-900/50 shadow-sm"
              >
                <Trash2 size={24}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
