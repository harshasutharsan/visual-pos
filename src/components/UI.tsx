import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const base = "h-16 font-black rounded-[28px] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 border-0 px-8";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30 border-b-8 border-emerald-800",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700",
    danger: "bg-red-50 dark:bg-red-950/20 text-red-600 border-2 border-red-100 dark:border-red-900/50",
    ghost: "bg-transparent text-slate-400 hover:text-indigo-600"
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>}
    <input 
      className={`w-full h-16 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[24px] px-6 font-bold focus:border-indigo-500 transition-all ${className}`}
      {...props} 
    />
  </div>
);

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-xl border-4 border-slate-100 dark:border-slate-800 ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);
