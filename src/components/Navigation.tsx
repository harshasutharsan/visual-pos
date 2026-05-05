import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, History, Users } from 'lucide-react';
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
    <nav className="fixed bottom-0 left-0 right-0 h-[120px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t-2 border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between z-[200] safe-area-inset-bottom">
      <div className="flex gap-3 items-center h-full">
        <NavItem active={activeTab === 'dashboard'} icon={<LayoutDashboard size={30} />} onClick={() => onTabChange('dashboard')} />
        <NavItem active={activeTab === 'sales'} icon={<ShoppingCart size={30} />} onClick={() => onTabChange('sales')} />
        <NavItem active={activeTab === 'inventory'} icon={<Package size={30} />} onClick={() => onTabChange('inventory')} />
        <NavItem active={activeTab === 'history'} icon={<History size={30} />} onClick={() => onTabChange('history')} />
        <NavItem active={activeTab === 'customers'} icon={<Users size={30} />} onClick={() => onTabChange('customers')} />
      </div>

      {activeTab === 'sales' && cartCount > 0 && (
        <button 
          onClick={onOpenCheckout}
          className="h-16 bg-emerald-600 text-white rounded-[24px] px-8 font-black text-xl flex items-center gap-3 shadow-2xl border-0 active:scale-95 transition-all"
        >
          CHECKOUT <span className="font-black text-2xl tracking-tighter">LKR {totalAmount.toFixed(0)}</span>
        </button>
      )}
    </nav>
  );
};

const NavItem = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`w-18 h-18 rounded-[32px] flex items-center justify-center transition-all duration-300 border-b-4 ${active ? 'bg-indigo-600 text-white border-indigo-800 -translate-y-6 scale-110 shadow-2xl' : 'text-slate-400 bg-transparent border-transparent'}`}
  >
    {icon}
  </button>
);
