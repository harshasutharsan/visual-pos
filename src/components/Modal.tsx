import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  fullHeight?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-md',
  fullHeight = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className={`fixed inset-0 z-[250] bg-slate-950/90 flex ${fullHeight ? 'items-end' : 'items-center'} justify-center p-6`}
        >
          <motion.div 
            initial={{ scale: 0.95, y: fullHeight ? '100%' : 0 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.95, y: fullHeight ? '100%' : 0 }}
            transition={{ duration: 0.15 }}
            className={`bg-white dark:bg-slate-900 w-full ${maxWidth} ${fullHeight ? 'rounded-t-[64px] max-h-[95vh]' : 'rounded-[48px] max-h-[90vh]'} p-10 shadow-2xl overflow-y-auto no-scrollbar relative border-4 border-slate-100 dark:border-slate-800`}
          >
            {fullHeight && <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 mx-auto mb-10 rounded-full" />}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">{title}</h2>
              <button 
                onClick={onClose} 
                className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 transition-transform active:rotate-90"
              >
                <X />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
