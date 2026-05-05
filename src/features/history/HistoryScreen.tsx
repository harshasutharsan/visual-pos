import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Transaction } from '../../types';
import { Button } from '../../components/UI';

interface HistoryScreenProps {
  transactions: Transaction[];
  onDownloadReceipt: (tx: Transaction) => void;
  onExportCSV: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ 
  transactions, 
  onDownloadReceipt, 
  onExportCSV 
}) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Past Bills</h2>
        <Button onClick={onExportCSV} className="h-14 rounded-3xl text-xs px-8" variant="primary">
          Download CSV
        </Button>
      </div>
      <div className="space-y-4">
        {transactions.slice().reverse().map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] flex items-center justify-between border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <div>
              <h4 className="font-black text-base italic leading-tight">ORDER #{t.id}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {new Date(t.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="text-right flex items-center gap-6">
              <div>
                <p className="font-black text-indigo-600 text-2xl tracking-tighter leading-tight">LKR {t.total}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{t.paymentMethod}</p>
              </div>
              <button 
                onClick={() => onDownloadReceipt(t)} 
                className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              >
                <Download size={20}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
