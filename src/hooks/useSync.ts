import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/database';
import { supabase } from '../services/supabase';

export const useSync = (session: any) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const unsyncedCount = useLiveQuery(async () => {
    const p = await db.products.where('synced').equals(0).count();
    const t = await db.transactions.where('synced').equals(0).count();
    const c = await db.customers.where('synced').equals(0).count();
    const cat = await db.categories.where('synced').equals(0).count();
    return p + t + c + cat;
  }) || 0;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && session?.user?.id) {
      const deltaSync = async () => {
        const unsyncedTx = await db.transactions.where('synced').equals(0).toArray();
        for (const tx of unsyncedTx) {
          const { error } = await supabase.from('transactions').upsert({ ...tx, userId: session.user.id, synced: 1 });
          if (!error && tx.id) await db.transactions.update(tx.id, { synced: 1 });
        }
        const unsyncedProd = await db.products.where('synced').equals(0).toArray();
        for (const p of unsyncedProd) {
          const { error } = await supabase.from('products').upsert({ ...p, userId: session.user.id, synced: 1 });
          if (!error && p.id) await db.products.update(p.id, { synced: 1 });
        }
        const unsyncedCust = await db.customers.where('synced').equals(0).toArray();
        for (const c of unsyncedCust) {
          const { error } = await supabase.from('customers').upsert({ ...c, userId: session.user.id, synced: 1 });
          if (!error && c.id) await db.customers.update(c.id, { synced: 1 });
        }
        const unsyncedCats = await db.categories.where('synced').equals(0).toArray();
        for (const cat of unsyncedCats) {
          const { error } = await supabase.from('categories').upsert({ ...cat, userId: session.user.id, synced: 1 });
          if (!error && cat.id) await db.categories.update(cat.id, { synced: 1 });
        }
      };
      deltaSync();
    }
  }, [isOnline, unsyncedCount, session]);

  return { isOnline, unsyncedCount };
};
