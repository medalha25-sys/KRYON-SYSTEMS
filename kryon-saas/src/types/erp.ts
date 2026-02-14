
export type AppView = 'login' | 'dashboard' | 'user-form' | 'vendas' | 'estoque' | 'servicos' | 'financeiro' | 'relatorios';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'operator' | 'caixa' | 'tecnico' | 'funcionario';
  avatar?: string;
}

export interface Profile {
  id: string;
  name: string;
  role: 'admin' | 'operator' | 'caixa' | 'tecnico' | 'funcionario';
  shop_id?: string;
}

export interface SalesData {
  day: string;
  value: number;
}

export interface PaymentData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  remaining: number;
  image: string;
  price: number;
  shop_id: string;
}

export interface ServiceOrder {
  id: string;
  client: string;
  device: string;
  status: 'analysis' | 'waiting' | 'ready' | 'delayed';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  sku?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Payment {
  id: string;
  method: 'money' | 'credit' | 'debit' | 'pix' | 'on_account';
  amount: number;
  transaction_id?: string;
  transaction_date?: string;
}
