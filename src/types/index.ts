export interface Product {
  id?: number;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minThreshold: number;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'pkt';
  image?: string | null;
  color?: string;
  userId?: string;
  synced: number;
  updatedAt: number;
}

export interface Transaction {
  id?: number;
  items: CartItem[];
  total: number;
  discount: number;
  paymentMethod: string;
  amountReceived: number;
  changeAmount: number;
  customerId?: number;
  customerName?: string;
  timestamp: number;
  userId?: string;
  synced: number;
}

export interface Merchant {
  id: string;
  shop_name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  currency?: string;
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  points: number;
  creditBalance: number;
  userId?: string;
  synced: number;
}

export interface Category {
  id?: number;
  name: string;
  icon?: string;
  userId?: string;
  synced: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedUnit: 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'pkt';
}

export type AuthMode = 'login' | 'signup' | 'landing';
export type AppTab = 'dashboard' | 'sales' | 'inventory' | 'history' | 'customers';
