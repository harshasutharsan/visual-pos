import Dexie, { type Table } from 'dexie';
import { Product, Transaction, Customer, Category } from '../types';

export class POSDatabase extends Dexie {
  products!: Table<Product>;
  transactions!: Table<Transaction>;
  customers!: Table<Customer>;
  categories!: Table<Category>;

  constructor() {
    super('POSDatabase');
    this.version(7).stores({
      products: '++id, name, category, userId, synced, updatedAt',
      transactions: '++id, timestamp, userId, synced',
      customers: '++id, phone, userId, synced',
      categories: '++id, name, userId, synced'
    });
  }
}

export const db = new POSDatabase();

export const seedDatabase = async (userId?: string) => {
  const catCount = await db.categories.count();
  if (catCount === 0) {
    const initialCats = [
      { name: 'Vegetables', icon: '🥕', userId, synced: 0 },
      { name: 'Fruits', icon: '🍎', userId, synced: 0 },
      { name: 'Groceries', icon: '📦', userId, synced: 0 },
      { name: 'Fish', icon: '🐟', userId, synced: 0 },
      { name: 'Meat', icon: '🥩', userId, synced: 0 },
      { name: 'Beverages', icon: '🥤', userId, synced: 0 }
    ];
    await db.categories.bulkAdd(initialCats);
  }

  const count = await db.products.count();
  if (count === 0) {
    const products = [
      { 
        name: 'Fresh Tomatoes', 
        category: 'Vegetables', 
        price: 45, 
        costPrice: 30, 
        stock: 50, 
        minThreshold: 10, 
        unit: 'kg', 
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
        color: '#ef4444',
        updatedAt: Date.now(),
        userId, synced: 0 
      },
      { 
        name: 'Red Onions', 
        category: 'Vegetables', 
        price: 60, 
        costPrice: 40, 
        stock: 35, 
        minThreshold: 5, 
        unit: 'kg', 
        image: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400&h=400&fit=crop',
        color: '#7e22ce',
        updatedAt: Date.now(),
        userId, synced: 0 
      },
      { 
        name: 'Organic Bananas', 
        category: 'Fruits', 
        price: 80, 
        costPrice: 50, 
        stock: 42, 
        minThreshold: 12, 
        unit: 'kg', 
        image: 'https://images.unsplash.com/photo-1528825876-196722203cdf?w=400&h=400&fit=crop',
        color: '#facc15',
        updatedAt: Date.now(),
        userId, synced: 0 
      }
    ];
    await db.products.bulkAdd(products);
  }

  const custCount = await db.customers.count();
  if (custCount === 0) {
    await db.customers.bulkAdd([
      { name: 'Walk-in Customer', phone: '0000', points: 0, creditBalance: 0, userId, synced: 0 },
      { name: 'Common Store Account', phone: '1111', points: 150, creditBalance: 0, userId, synced: 0 }
    ]);
  }
};
