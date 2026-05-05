import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Product, Category, CartItem } from '../../types';

interface SalesScreenProps {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  addToCart: (p: Product) => void;
  removeFromCart: (id: number, removeAll?: boolean) => void;
  topProducts: Product[];
}

export const SalesScreen: React.FC<SalesScreenProps> = ({
  products,
  categories,
  cart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  addToCart,
  removeFromCart,
  topProducts
}) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="space-y-6">
      <div className="relative px-2">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <input 
          type="text" 
          placeholder="Scan or Search Product..." 
          className="w-full h-18 bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-[32px] px-16 font-bold shadow-xl focus:border-indigo-600 transition-all text-xl" 
          onChange={(e) => setSearchQuery(e.target.value)} 
          value={searchQuery}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
        <button 
          onClick={() => setSelectedCategory('All')} 
          className={`px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedCategory === 'All' ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg scale-95' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setSelectedCategory(cat.name)} 
            className={`px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-3 border-2 ${selectedCategory === cat.name ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg scale-95' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}
          >
            <span className="text-xl leading-none">{cat.icon || '✨'}</span>{cat.name}
          </button>
        ))}
      </div>

      {selectedCategory === 'All' && searchQuery === '' && (
        <div className="space-y-4 px-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Quick Add</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {topProducts.map(p => (
              <motion.div 
                whileTap={{ scale: 0.9 }} 
                key={`top-${p.id}`} 
                onClick={() => p.stock > 0 && addToCart(p)} 
                className="min-w-[150px] aspect-square rounded-[44px] bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-5 text-center shadow-md relative overflow-hidden group"
              >
                <div className="text-4xl mb-3 relative z-10 leading-none">{p.category[0]}</div>
                <p className="text-[11px] font-black uppercase truncate w-full relative z-10 text-slate-900 dark:text-white leading-tight">{p.name}</p>
                <p className="text-[13px] font-black text-indigo-600 relative z-10 mt-1">LKR {p.price}</p>
                {p.image && <img src={p.image} className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale group-hover:opacity-20 transition-opacity" />}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pb-24 px-2">
        {products.map(p => {
          const itemInCart = cart.find(i => i.id === p.id);
          return (
            <motion.div 
              onContextMenu={(e) => { e.preventDefault(); removeFromCart(p.id!, true); }} 
              whileTap={{ scale: 0.95 }} 
              key={p.id} 
              onClick={() => p.stock > 0 && addToCart(p)} 
              className={`relative aspect-square rounded-[48px] overflow-hidden shadow-2xl border-4 transition-all ${itemInCart ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-white dark:border-slate-800 bg-white dark:bg-slate-900'} ${p.stock <= 0 ? 'opacity-30' : ''}`}
            >
              <div className="absolute inset-0 z-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-cover" alt={p.name} loading="lazy" />
                ) : (
                  <div className="text-5xl font-black uppercase text-slate-300 dark:text-slate-700">{p.name[0]}</div>
                )}
              </div>
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-black text-[13px] uppercase tracking-tight leading-tight mb-1">{p.name}</h3>
                <p className="text-emerald-400 font-black text-xl tracking-tighter">LKR {p.price.toFixed(0)}</p>
              </div>
              {itemInCart && (
                <motion.div 
                  onClick={(e) => { e.stopPropagation(); removeFromCart(p.id!); }} 
                  initial={{ scale: 0.5 }} 
                  animate={{ scale: 1 }} 
                  className="absolute top-5 right-5 w-14 h-14 bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl ring-4 ring-white dark:ring-slate-900 active:scale-90 transition-transform group"
                >
                  <span className="text-xl leading-none">{itemInCart.quantity}</span>
                  <span className="text-[8px] font-black uppercase opacity-60 leading-none mt-1 group-hover:text-red-200">-1</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
