import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button, Input } from '../../components/UI';
import { AuthMode } from '../../types';

interface AuthScreenProps {
  onAuth: (mode: 'login' | 'signup', payload: any) => Promise<boolean>;
  isLoading: boolean;
  error: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth, isLoading, error }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onAuth(authMode === 'login' ? 'login' : 'signup', { phone, password, shopName });
    if (success && authMode === 'signup') setAuthMode('login');
  };

  if (authMode === 'landing') {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#020617] p-8 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-12 max-w-md w-full">
          <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl mx-auto"><Sparkles size={48} /></div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tight dark:text-white">VisualPOS</h1>
            <p className="text-xl text-slate-500 font-bold leading-relaxed">High Performance. Low Complexity.</p>
          </div>
          <div className="space-y-4 pt-6">
            <Button variant="success" fullWidth onClick={() => setAuthMode('signup')} className="text-2xl group">Setup Shop <ArrowRight className="group-hover:translate-x-2 transition-transform" /></Button>
            <Button variant="secondary" fullWidth onClick={() => setAuthMode('login')}>Login</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#020617] p-8 flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-slate-900 p-10 space-y-8 rounded-[40px] shadow-2xl border-2 border-slate-100 dark:border-slate-800">
        <button onClick={() => setAuthMode('landing')} className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-colors"><ArrowLeft size={16} /> Back</button>
        <h2 className="text-4xl font-black tracking-tight">{authMode === 'login' ? 'Welcome Back' : 'Register Store'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {authMode === 'signup' && (
            <Input label="Store Name" value={shopName} onChange={e => setShopName(e.target.value)} required placeholder="Shop Name" />
          )}
          <Input label="Mobile / Email" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="ID" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          {error && <p className="text-red-600 text-xs font-black bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border-2 border-red-100 dark:border-red-900/50 flex items-center gap-2"><AlertCircle size={14} /> {error}</p>}
          <Button disabled={isLoading} type="submit" fullWidth className="text-xl mt-6">
            {isLoading ? 'Authenticating...' : authMode === 'login' ? 'Enter Shop' : 'Create Shop'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
