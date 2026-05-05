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
  addToCart: (product: Product, qty?: number, unit?: any) => void;
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
  addToCart
}) => {
  return (
    <div className="space-y-6">
      {/* Search Bar - Corporate Minimalist */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] pl-16 pr-8 font-bold text-lg shadow-sm focus:border-indigo-500 focus:outline-none transition-all"
        />
      </div>

      {/* Horizontal Category Scroll */}
      <div className="sticky top-[88px] z-40 -mx-6 px-6 bg-slate-50/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-4 px-2">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`flex-shrink-0 px-6 h-11 rounded-full font-black text-xs uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex-shrink-0 px-6 h-11 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${selectedCategory === cat.name ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map(p => {
          const itemInCart = cart.find(i => i.id === p.id);
          return (
            <motion.div 
              whileTap={{ scale: 0.95 }} 
              key={p.id} 
              onClick={() => p.stock > 0 && addToCart(p)} 
              className={`group relative bg-white dark:bg-slate-900 p-3 rounded-[32px] border-2 transition-all cursor-pointer shadow-sm ${itemInCart ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-100 dark:border-slate-800 active:border-indigo-400'}`}
            >
              <div className="aspect-square rounded-[24px] overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: p.color + '20', color: p.color }}>{p.name[0]}</div>
                )}
              </div>
              
              <div className="px-1 space-y-1">
                <h3 className="font-black text-sm uppercase tracking-tight truncate dark:text-white">{p.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-black">LKR {p.price}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {p.stock > 0 ? `${p.stock}${p.unit}` : 'OUT'}
                  </span>
                </div>
              </div>

              {itemInCart && (
                <div className="absolute top-4 right-4 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                  {itemInCart.quantity}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
