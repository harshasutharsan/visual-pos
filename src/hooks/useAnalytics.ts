import { useMemo } from 'react';
import { Transaction } from '../types';

export const useAnalytics = (transactions: Transaction[]) => {
  const analyticsData = useMemo(() => {
    if (!transactions.length) return { dailyTrend: Array(7).fill({ name: '', revenue: 0 }) };
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * oneDay);
      const start = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const end = new Date(d.setHours(23, 59, 59, 999)).getTime();
      
      return {
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: transactions
          .filter(t => t.timestamp >= start && t.timestamp <= end)
          .reduce((s, t) => s + t.total, 0)
      };
    });

    return { dailyTrend };
  }, [transactions]);

  return analyticsData;
};
