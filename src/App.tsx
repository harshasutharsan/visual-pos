import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { jsPDF } from 'jspdf';
import { 
  Banknote, SmartphoneNfc, Trash2, Camera, CheckCircle2, Download, MessageSquare
} from 'lucide-react';

// Services & Types
import { db } from './services/database';
import { Product, Transaction, AppTab, CartItem } from './types';
import { formatWhatsAppBill } from './utils/formatters';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Weight Logic State
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [tempWeight, setTempWeight] = useState<string>('1');
  const [tempUnit, setTempUnit] = useState<'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'pkt'>('pcs');

  // Queries
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const categoriesList = useLiveQuery(() => db.categories.toArray()) || [];
  const merchant = useLiveQuery(() => db.merchants.where('id').equals(session?.user?.id || '').first());
  
  const analyticsData = useAnalytics(transactions);

  // Checkout State
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const addToCart = (product: Product, customQty?: number, customUnit?: any) => {
    const isWeighted = ['kg', 'L', 'g', 'ml'].includes(product.unit);
    
    if (isWeighted && !customQty) {
      setPendingProduct(product);
      setTempUnit(product.unit as any);
      setTempWeight(product.unit === 'g' || product.unit === 'ml' ? '250' : '1');
      setIsWeightModalOpen(true);
      return;
    }

    setCart(prev => {
      const quantity = customQty || 1;
      const unit = customUnit || product.unit;
      const existing = prev.find(i => i.id === product.id && i.selectedUnit === unit);
      
      if (existing) {
        return prev.map(i => i.id === product.id && i.selectedUnit === unit 
          ? { ...i, quantity: i.quantity + quantity } 
          : i
        );
      }
      return [...prev, { ...product, quantity, selectedUnit: unit }];
    });
    setIsWeightModalOpen(false);
  };

  const removeFromCart = (productId: number, unit: string) => {
    setCart(prev => prev.filter(i => !(i.id === productId && i.selectedUnit === unit)));
  };

  const updateCartItemPrice = (productId: number, unit: string, newPrice: number) => {
    setCart(prev => prev.map(i => i.id === productId && i.selectedUnit === unit 
      ? { ...i, price: newPrice } 
      : i
    ));
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((s, i) => {
      const factor = ['g', 'ml'].includes(i.selectedUnit) ? i.quantity / 1000 : i.quantity;
      return s + i.price * factor;
    }, 0);
    return Math.max(0, subtotal - discount);
  };

  const handleCheckout = async (paymentMethod: string) => {
    const total = getCartTotal();
    const changeAmount = paymentMethod === 'Cash' ? Math.max(0, amountReceived - total) : 0;

    const tx: Transaction = { 
      items: [...cart], 
      total, 
      discount,
      paymentMethod, 
      amountReceived: paymentMethod === 'Cash' ? amountReceived : total,
      changeAmount,
      customerId: selectedCustomer || undefined,
      customerName: customers.find(c => c.id === selectedCustomer)?.name,
      timestamp: Date.now(), 
      synced: 0, 
      userId: session?.user?.id 
    };
    
    const txId = await db.transactions.add(tx);
    setLastTransaction({ ...tx, id: txId as number });
    
    for (const item of cart) {
      const p = await db.products.get(item.id!);
      if (p) {
        const factor = ['g', 'ml'].includes(item.selectedUnit) ? item.quantity / 1000 : item.quantity;
        await db.products.update(item.id!, { stock: Math.max(0, p.stock - factor), synced: 0 });
      }
    }

    if (selectedCustomer) {
      const c = await db.customers.get(selectedCustomer);
      if (c) await db.customers.update(selectedCustomer, { points: c.points + Math.floor(total / 100), synced: 0 });
    }
    
    setIsCheckoutOpen(false);
    setCart([]);
    setDiscount(0);
    setAmountReceived(0);
    setSelectedCustomer(null);
    setIsSuccessOpen(true);
  };

  const generateReceiptPDF = (tx: Transaction) => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 150] });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text(merchant?.shop_name || 'VISUAL POS', 40, 10, { align: 'center' });
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    if (merchant?.address) doc.text(merchant.address, 40, 15, { align: 'center' });
    doc.text(`Bill #: ${tx.id} | ${new Date(tx.timestamp).toLocaleString()}`, 5, 28);
    doc.line(5, 30, 75, 30);
    let y = 35;
    tx.items.forEach((i) => {
      doc.text(`${i.name.substring(0, 18)}`, 5, y);
      doc.text(`${i.quantity}${i.selectedUnit} x ${i.price}`, 35, y);
      const factor = ['g', 'ml'].includes(i.selectedUnit) ? i.quantity / 1000 : i.quantity;
      doc.text(`${(i.price * factor).toFixed(0)}`, 75, y, { align: 'right' });
      y += 5;
    });
    doc.line(5, y, 75, y); y += 6;
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 5, y); doc.text(`LKR ${tx.total.toLocaleString()}`, 75, y, { align: 'right' });
    doc.save(`Receipt-${tx.id}.pdf`);
  };

  if (!session) return <AuthScreen onAuth={handleAuth} isLoading={isAuthLoading} error={authError} />;

  return (
    <div className="min-h-screen pb-[140px] transition-colors font-['Outfit'] bg-slate-50 dark:bg-[#020617]">
      <Header isOnline={isOnline} unsyncedCount={unsyncedCount} onLogout={logout} onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="p-6 max-w-4xl mx-auto space-y-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard revenue={analyticsData.dailyTrend[6].revenue} salesCount={transactions.length} lowStockCount={products.filter(p => p.stock <= p.minThreshold).length} onNavigate={(t) => setActiveTab(t as AppTab)} />}
          {activeTab === 'sales' && <SalesScreen products={products.filter(p => (selectedCategory === 'All' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase()))} categories={categoriesList} cart={cart} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} addToCart={addToCart} topProducts={products.slice(0, 4)} />}
          {activeTab === 'inventory' && <InventoryScreen products={products} onAddProduct={() => { setEditingProduct(null); setPreviewImage(null); setIsProductModalOpen(true); }} onEditProduct={(p) => { setEditingProduct(p); setPreviewImage(p.image || null); setIsProductModalOpen(true); }} onManageCategories={() => {}} />}
          {activeTab === 'history' && <HistoryScreen transactions={transactions} onDownloadReceipt={generateReceiptPDF} onExportCSV={() => {}} />}
        </AnimatePresence>
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} cartCount={cart.length} totalAmount={getCartTotal()} onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* STORE SETTINGS MODAL */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Store Profile">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          await db.merchants.put({ id: session.user.id, shop_name: f.get('shop_name') as string, address: f.get('address') as string, phone: f.get('phone') as string });
          setIsSettingsOpen(false);
        }} className="space-y-6">
          <Input label="Store Name" name="shop_name" defaultValue={merchant?.shop_name} required />
          <Input label="Address" name="address" defaultValue={merchant?.address} />
          <Input label="Phone Number" name="phone" defaultValue={merchant?.phone} />
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-6 rounded-[24px]">
             <span className="text-xs font-black uppercase tracking-widest">Dark Mode</span>
             <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-16 h-10 rounded-full flex items-center px-1 transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`w-8 h-8 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
             </button>
          </div>
          <Button type="submit" fullWidth>Update Profile</Button>
        </form>
      </Modal>

      {/* WEIGHT PICKER MODAL */}
      <Modal isOpen={isWeightModalOpen} onClose={() => setIsWeightModalOpen(false)} title="Select Quantity">
        <div className="space-y-8 p-4">
          <div className="flex gap-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-[28px]">
            {['kg', 'g', 'L', 'ml', 'pcs'].map((u) => (
              <button key={u} onClick={() => setTempUnit(u as any)} className={`flex-1 h-16 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all ${tempUnit === u ? 'bg-white dark:bg-slate-700 shadow-lg scale-105' : 'text-slate-400'}`}>{u}</button>
            ))}
          </div>
          <div className="relative">
             <input type="number" value={tempWeight} onChange={e => setTempWeight(e.target.value)} className="w-full h-32 bg-slate-50 dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-[40px] text-center text-6xl font-black focus:outline-none focus:border-indigo-500" autoFocus />
             <div className="absolute right-10 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400 uppercase tracking-widest">{tempUnit}</div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-8 rounded-[40px] flex justify-between items-center border-2 border-indigo-100 dark:border-indigo-800">
             <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Price</span>
             <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">LKR {(pendingProduct ? (pendingProduct.price * (['g', 'ml'].includes(tempUnit) ? Number(tempWeight) / 1000 : Number(tempWeight))) : 0).toFixed(0)}</span>
          </div>
          <Button fullWidth className="h-24 text-2xl rounded-[32px]" onClick={() => { if (pendingProduct) addToCart(pendingProduct, Number(tempWeight), tempUnit); }}>ADD TO CART</Button>
        </div>
      </Modal>

      {/* CHECKOUT MODAL */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="CART" fullHeight maxWidth="max-w-xl">
        <div className="flex-1 overflow-y-auto space-y-6 mb-10 no-scrollbar">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Customer</p>
            <select value={selectedCustomer || ''} onChange={e => setSelectedCustomer(Number(e.target.value) || null)} className="w-full h-14 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 font-bold">
              <option value="">Walk-in Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>
          {cart.map((item) => (
            <div key={`${item.id}-${item.selectedUnit}`} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border-4 border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="space-y-2">
                <h4 className="font-black text-2xl uppercase text-slate-900 dark:text-white">{item.name}</h4>
                <div className="flex flex-col">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Price (Edit)</p>
                   <div className="flex items-center gap-2">
                     <span className="text-xl font-black text-indigo-600">LKR</span>
                     <input 
                      type="number" 
                      value={item.price} 
                      onChange={e => updateCartItemPrice(item.id!, item.selectedUnit, Number(e.target.value))}
                      className="w-24 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-1 font-black text-xl text-indigo-600 focus:outline-none focus:border-indigo-500"
                    />
                   </div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">
                      Subtotal: LKR {(item.price * (['g', 'ml'].includes(item.selectedUnit) ? item.quantity / 1000 : item.quantity)).toFixed(0)}
                   </p>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id!, item.selectedUnit)} className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center active:scale-90 border-2 border-red-100 dark:border-red-800"><Trash2 size={24} /></button>
            </div>
          ))}
        </div>
        <div className="space-y-6 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount</p>
              <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full bg-transparent text-2xl font-black text-red-500 focus:outline-none" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Received</p>
              <input type="number" value={amountReceived} onChange={e => setAmountReceived(Number(e.target.value))} className="w-full bg-transparent text-2xl font-black text-emerald-600 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-between items-end px-6">
            <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CHANGE</span><p className="text-3xl font-black text-emerald-500">LKR {Math.max(0, amountReceived - getCartTotal()).toFixed(0)}</p></div>
            <div className="text-right"><span className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">TOTAL</span><p className="text-7xl font-black text-indigo-600 tracking-tighter">LKR {getCartTotal().toLocaleString()}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <button onClick={() => handleCheckout('Cash')} className="h-32 bg-emerald-600 text-white rounded-[48px] flex flex-col items-center justify-center gap-2 shadow-2xl border-b-8 border-emerald-800 active:scale-95 transition-all"><Banknote size={44}/><span className="text-xs font-black uppercase mt-2">CASH</span></button>
            <button onClick={() => handleCheckout('QR')} className="h-32 bg-indigo-600 text-white rounded-[48px] flex flex-col items-center justify-center gap-2 shadow-2xl border-b-8 border-indigo-800 active:scale-95 transition-all"><SmartphoneNfc size={44}/><span className="text-xs font-black uppercase mt-2">QR / CARD</span></button>
          </div>
        </div>
      </Modal>

      {/* PRODUCT MODAL */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Item Info">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const data: any = { name: f.get('name'), category: f.get('category'), price: Number(f.get('price')), stock: Number(f.get('stock')), minThreshold: Number(f.get('minThreshold')), unit: f.get('unit'), image: previewImage, userId: session.user.id, synced: 0, updatedAt: Date.now() };
          if (editingProduct?.id) await db.products.update(editingProduct.id, data); else await db.products.add(data);
          setIsProductModalOpen(false);
        }} className="space-y-6">
          <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/3] bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border-4 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden relative">{previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" size={56} />}<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => setPreviewImage(r.result as string); r.readAsDataURL(file); } }} /></div>
          <Input label="Product Name" name="name" required defaultValue={editingProduct?.name} />
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label><select name="category" defaultValue={editingProduct?.category} className="w-full h-16 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[24px] px-6 font-bold uppercase text-xs">{categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
             <Input label="Unit" name="unit" defaultValue={editingProduct?.unit || 'kg'} />
          </div>
          <div className="grid grid-cols-2 gap-4"><Input label="Price" name="price" type="number" required defaultValue={editingProduct?.price} /><Input label="Stock" name="stock" type="number" required defaultValue={editingProduct?.stock} /></div>
          <Button type="submit" fullWidth className="border-b-8 border-indigo-800">SAVE TO CLOUD</Button>
        </form>
      </Modal>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {isSuccessOpen && lastTransaction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-indigo-950 flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[72px] p-12 shadow-2xl text-center space-y-12 relative flex flex-col items-center border-b-[16px] border-emerald-600">
              <div className="w-40 h-40 bg-emerald-100 dark:bg-emerald-900/40 rounded-[56px] flex items-center justify-center text-emerald-600 shadow-inner"><CheckCircle2 size={100} /></div>
              <div className="space-y-6 w-full"><p className="text-xs font-black text-slate-400 uppercase tracking-[0.6em]">SUCCESS</p><h2 className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white">LKR {lastTransaction.total.toLocaleString()}</h2></div>
              <div className="space-y-5 pt-4 w-full">
                <Button variant="success" fullWidth onClick={() => generateReceiptPDF(lastTransaction)} className="text-2xl"><Download size={32} /> PRINT BILL</Button>
                {customers.find(c => c.id === lastTransaction.customerId)?.phone && (
                  <Button variant="primary" fullWidth onClick={() => { const phone = customers.find(c => c.id === lastTransaction.customerId)?.phone; const msg = formatWhatsAppBill(lastTransaction, merchant); window.open(`https://wa.me/${phone}?text=${msg}`, '_blank'); }} className="text-2xl bg-emerald-500"><MessageSquare size={32} /> WHATSAPP BILL</Button>
                )}
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
