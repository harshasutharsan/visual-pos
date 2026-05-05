import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, History, Users, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  cartCount: number;
  totalAmount: number;
  onOpenCheckout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  cartCount, 
  totalAmount, 
  onOpenCheckout 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] pointer-events-none">
      {/* Floating Cart Bar - Premium Mobile POS Style */}
      <AnimatePresence>
        {activeTab === 'sales' && cartCount > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="px-4 pb-4 pointer-events-auto"
          >
            <button 
              onClick={onOpenCheckout}
              className="w-full h-20 bg-indigo-600 dark:bg-indigo-500 text-white rounded-[32px] px-8 flex items-center justify-between shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all border-t border-indigo-400/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black text-xl">
                  {cartCount}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Review Order</p>
                  <p className="text-2xl font-black tracking-tighter">LKR {totalAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest bg-white/10 px-6 py-3 rounded-2xl">
                Checkout <ChevronRight size={20} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tab Navigation - Corporate Minimalist */}
      <nav className="h-[96px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-t border-slate-200/50 dark:border-slate-800/50 px-6 flex items-center justify-between pointer-events-auto safe-area-inset-bottom">
        <NavItem active={activeTab === 'dashboard'} icon={<LayoutDashboard size={24} />} label="Home" onClick={() => onTabChange('dashboard')} />
        <NavItem active={activeTab === 'sales'} icon={<ShoppingCart size={24} />} label="Sales" onClick={() => onTabChange('sales')} />
        <NavItem active={activeTab === 'inventory'} icon={<Package size={24} />} label="Items" onClick={() => onTabChange('inventory')} />
        <NavItem active={activeTab === 'history'} icon={<History size={24} />} label="History" onClick={() => onTabChange('history')} />
        <NavItem active={activeTab === 'customers'} icon={<Users size={24} />} label="Loyalty" onClick={() => onTabChange('customers')} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1.5 flex-1 transition-all duration-300 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
  >
    <div className={`p-2.5 rounded-2xl transition-all ${active ? 'bg-indigo-50 dark:bg-indigo-900/40 scale-110' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);
