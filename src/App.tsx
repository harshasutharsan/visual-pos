import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { jsPDF } from 'jspdf';
import { 
  Banknote, SmartphoneNfc, Trash2, Camera, CheckCircle2, Download
} from 'lucide-react';

// Services & Types
import { db } from './services/database';
import { Product, Transaction, AppTab, CartItem } from './types';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useSync } from './hooks/useSync';
import { useAnalytics } from './hooks/useAnalytics';

// UI Components
import { Button, Input } from './components/UI';
import { Modal } from './components/Modal';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';

// Feature Components
import { AuthScreen } from './features/auth/AuthScreen';
import { Dashboard } from './features/analytics/Dashboard';
import { SalesScreen } from './features/sales/SalesScreen';
import { InventoryScreen } from './features/inventory/InventoryScreen';
import { HistoryScreen } from './features/history/HistoryScreen';

const App = () => {
  const { session, isAuthLoading, authError, handleAuth, logout } = useAuth();
  const { isOnline, unsyncedCount } = useSync(session);
  
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [darkMode, setDarkMode] = useState(true);
  
  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const categoriesList = useLiveQuery(() => db.categories.toArray()) || [];
  
  const analyticsData = useAnalytics(transactions);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number, removeAll = false) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === productId);
      if (!existing) return prev;
      if (removeAll || existing.quantity <= 1) return prev.filter(i => i.id !== productId);
      return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const handleCheckout = async (paymentMethod: string) => {
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const tx: Transaction = { 
      items: [...cart], total, paymentMethod, timestamp: Date.now(), synced: 0, userId: session?.user?.id 
    };
    const txId = await db.transactions.add(tx);
    setLastTransaction({ ...tx, id: txId as number });
    
    // Update Stock
    for (const item of cart) {
      const p = await db.products.get(item.id!);
      if (p) await db.products.update(item.id!, { stock: Math.max(0, p.stock - item.quantity), synced: 0 });
    }
    
    setIsCheckoutOpen(false);
    setCart([]);
    setIsSuccessOpen(true);
  };

  const generateReceiptPDF = (tx: Transaction) => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 150] });
    doc.setFont('helvetica', 'bold'); doc.text('POS RECEIPT', 40, 10, { align: 'center' });
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(tx.timestamp).toLocaleString()}`, 5, 20);
    doc.line(5, 25, 75, 25);
    let y = 30;
    tx.items.forEach((i: any) => {
      doc.text(`${i.name} x ${i.quantity}`, 5, y);
      doc.text(`${(i.price * i.quantity).toFixed(0)}`, 75, y, { align: 'right' });
      y += 5;
    });
    doc.line(5, y, 75, y); y += 8;
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 5, y); doc.text(`LKR ${tx.total}`, 75, y, { align: 'right' });
    doc.save(`POS-Receipt-${tx.id}.pdf`);
  };

  if (!session) {
    return <AuthScreen onAuth={handleAuth} isLoading={isAuthLoading} error={authError} />;
  }

  return (
    <div className="min-h-screen pb-[140px] transition-colors font-['Outfit'] bg-slate-50 dark:bg-[#020617]">
      <Header 
        isOnline={isOnline} 
        unsyncedCount={unsyncedCount} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onLogout={logout} 
      />

      <main className="p-6 max-w-4xl mx-auto space-y-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <Dashboard 
              revenue={analyticsData.dailyTrend[6].revenue} 
              salesCount={transactions.length} 
              lowStockCount={products.filter(p => p.stock <= p.minThreshold).length}
              onNavigate={(t) => setActiveTab(t as AppTab)}
            />
          )}

          {activeTab === 'sales' && (
            <SalesScreen 
              products={products.filter(p => (selectedCategory === 'All' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase()))}
              categories={categoriesList}
              cart={cart}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              topProducts={products.slice(0, 4)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryScreen 
              products={products}
              onAddProduct={() => { setEditingProduct(null); setPreviewImage(null); setIsProductModalOpen(true); }}
              onEditProduct={(p) => { setEditingProduct(p); setPreviewImage(p.image || null); setIsProductModalOpen(true); }}
              onManageCategories={() => setIsCategoryModalOpen(true)}
            />
          )}

          {activeTab === 'history' && (
            <HistoryScreen 
              transactions={transactions}
              onDownloadReceipt={generateReceiptPDF}
              onExportCSV={() => {
                const csv = [['Date', 'ID', 'Payment', 'Total'], ...transactions.map(t => [new Date(t.timestamp).toLocaleString(), t.id, t.paymentMethod, t.total])].map(e => e.join(",")).join("\n");
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'sales.csv'; a.click();
              }}
            />
          )}
        </AnimatePresence>
      </main>

      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        cartCount={cart.length} 
        totalAmount={cart.reduce((s, i) => s + i.price * i.quantity, 0)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* MODALS */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Item Info">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const data: any = { 
            name: f.get('name'), category: f.get('category'), price: Number(f.get('price')), 
            costPrice: Number(f.get('costPrice')), stock: Number(f.get('stock')), 
            minThreshold: Number(f.get('minThreshold')), unit: f.get('unit'), 
            image: previewImage, userId: session.user.id, synced: 0, updatedAt: Date.now()
          };
          if (editingProduct?.id) await db.products.update(editingProduct.id, data);
          else await db.products.add(data);
          setIsProductModalOpen(false);
        }} className="space-y-6">
          <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/3] bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border-4 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden relative">
            {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" size={56} />}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { const r = new FileReader(); r.onloadend = () => setPreviewImage(r.result as string); r.readAsDataURL(file); }
            }} />
          </div>
          <Input label="Product Name" name="name" required defaultValue={editingProduct?.name} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
              <select name="category" defaultValue={editingProduct?.category} className="w-full h-16 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[24px] px-6 font-bold uppercase text-xs">
                {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Unit" name="unit" defaultValue={editingProduct?.unit || 'kg'} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" name="price" type="number" required defaultValue={editingProduct?.price} />
            <Input label="Stock" name="stock" type="number" required defaultValue={editingProduct?.stock} />
          </div>
          <Button type="submit" fullWidth className="border-b-8 border-indigo-800">SAVE TO CLOUD</Button>
        </form>
      </Modal>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Categories">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          await db.categories.add({ name: f.get('name') as string, icon: f.get('icon') as string, userId: session.user.id, synced: 0 });
        }} className="mb-8 flex gap-4 items-end">
          <Input label="Name" name="name" required />
          <Input label="Icon" name="icon" className="w-24 text-center" />
          <Button type="submit">Add</Button>
        </form>
        <div className="space-y-3">
          {categoriesList.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="flex items-center gap-4"><span>{cat.icon}</span><span className="font-black uppercase text-sm">{cat.name}</span></div>
              <button onClick={() => db.categories.delete(cat.id!)} className="text-red-500"><Trash2 size={20}/></button>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="CART" fullHeight maxWidth="max-w-xl">
        <div className="flex-1 overflow-y-auto space-y-6 mb-10 no-scrollbar">
          {cart.map((item, idx) => (
            <div key={item.id} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border-4 border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white font-black text-3xl shadow-xl">{item.quantity}</div>
                  <h4 className="font-black text-2xl uppercase tracking-tight truncate max-w-[180px] text-slate-900 dark:text-white">{item.name}</h4>
                </div>
                <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-600 w-16 h-16 flex items-center justify-center bg-red-50 dark:bg-red-950/20 rounded-3xl border-4 border-red-100 dark:border-red-900/30 active:scale-90"><Trash2 size={32} /></button>
              </div>
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-[32px] p-2 px-8 h-20 flex-1 justify-between shadow-lg border-4 border-slate-100 dark:border-slate-700">
                  <button onClick={() => removeFromCart(item.id!)} className="text-5xl font-black text-indigo-600">-</button>
                  <span className="font-black text-3xl">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="text-5xl font-black text-indigo-600">+</button>
                </div>
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-[32px] px-8 h-20 flex-1 gap-4 shadow-lg border-4 border-slate-100 dark:border-slate-700 font-black">
                  <span className="text-xs text-slate-400 uppercase tracking-widest">LKR</span>
                  <span className="text-2xl text-emerald-600">{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-10">
          <div className="flex justify-between items-end px-6">
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">TOTAL</span>
            <span className="text-7xl font-black text-indigo-600 tracking-tighter">LKR {cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(0)}</span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <button onClick={() => handleCheckout('Cash')} className="h-32 bg-emerald-600 text-white rounded-[48px] flex flex-col items-center justify-center gap-2 shadow-2xl border-b-8 border-emerald-800 active:scale-95 transition-all"><Banknote size={44}/><span className="text-xs font-black uppercase tracking-[0.2em] mt-2">CASH</span></button>
            <button onClick={() => handleCheckout('QR')} className="h-32 bg-indigo-600 text-white rounded-[48px] flex flex-col items-center justify-center gap-2 shadow-2xl border-b-8 border-indigo-800 active:scale-95 transition-all"><SmartphoneNfc size={44}/><span className="text-xs font-black uppercase tracking-[0.2em] mt-2">QR / CARD</span></button>
          </div>
        </div>
      </Modal>

      <AnimatePresence>
        {isSuccessOpen && lastTransaction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-indigo-950 flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[72px] p-12 shadow-2xl text-center space-y-12 relative flex flex-col items-center border-b-[16px] border-emerald-600">
              <div className="w-40 h-40 bg-emerald-100 dark:bg-emerald-900/40 rounded-[56px] flex items-center justify-center text-emerald-600 shadow-inner"><CheckCircle2 size={100} /></div>
              <div className="space-y-6 w-full">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.6em]">SUCCESS</p>
                <h2 className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white">LKR {lastTransaction.total.toLocaleString()}</h2>
              </div>
              <div className="space-y-5 pt-4 w-full">
                <Button variant="success" fullWidth onClick={() => generateReceiptPDF(lastTransaction)} className="text-2xl"><Download size={32} /> PRINT BILL</Button>
                <Button variant="secondary" fullWidth onClick={() => setIsSuccessOpen(false)}>NEXT ORDER</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
