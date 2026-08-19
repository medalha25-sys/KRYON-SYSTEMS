export type UserRole = 'super_admin' | 'admin' | 'gerente' | 'vendedor' | 'caixa';

export interface Store {
  id: string;
  name: string;
  trade_name?: string;
  cnpj_cpf?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  receipt_message?: string;
  pix_key?: string;
  pix_beneficiary_name?: string;
  pix_city?: string;
  currency: string;
  timezone: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  store_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  password?: string;
  active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  store_id: string;
  company_name: string;
  trade_name?: string;
  cnpj_cpf?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
  active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  cpf_cnpj?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  total_spent: number;
  total_purchases: number;
  credit_limit: number;
  credit_used: number;
  active: boolean;
  created_at: string;
}

export type ProductUnit = 'unidade' | 'kit' | 'caixa' | 'pacote' | 'duzia' | 'par';

export interface Product {
  id: string;
  store_id: string;
  category_id?: string;
  category_name?: string;
  supplier_id?: string;
  supplier_name?: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  brand?: string;
  unit: ProductUnit;
  cost_price: number;
  sale_price: number;
  profit_margin?: number; // ((sale_price - cost_price) / cost_price) * 100
  current_stock: number;
  min_stock: number;
  max_stock: number;
  image_url?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export type StockMovementType = 'entrada' | 'saida' | 'ajuste' | 'perda' | 'devolucao' | 'inventario';

export interface StockMovement {
  id: string;
  store_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  user_id: string;
  user_name: string;
  sale_id?: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  cost_price: number;
  reason: string;
  notes?: string;
  created_at: string;
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito' | 'fiado' | 'outro';

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  installments?: number;
  change_amount?: number;
}

export interface SaleItem {
  id?: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  cost_price: number;
  quantity: number;
  discount: number;
  total_price: number;
}

export type SaleStatus = 'completed' | 'cancelled' | 'refunded';

export interface Sale {
  id: string;
  store_id: string;
  cash_register_id?: string;
  sale_number: string;
  customer_id?: string;
  customer_name?: string;
  customer_document?: string;
  cashier_id: string;
  cashier_name: string;
  subtotal: number;
  discount: number;
  discount_type: 'value' | 'percent';
  total: number;
  total_cost: number;
  payment_method: string;
  payments: PaymentEntry[];
  items: SaleItem[];
  status: SaleStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type CashRegisterStatus = 'open' | 'closed';

export interface CashRegister {
  id: string;
  store_id: string;
  user_id: string;
  user_name: string;
  opened_at: string;
  closed_at?: string;
  initial_float: number;
  closing_cash_counted?: number;
  closing_cash_expected?: number;
  difference?: number;
  status: CashRegisterStatus;
  notes?: string;
  created_at: string;
}

export type CashMovementType = 'sangria' | 'suprimento' | 'venda' | 'despesa' | 'recebimento' | 'estorno';

export interface CashMovement {
  id: string;
  cash_register_id: string;
  store_id: string;
  user_id: string;
  user_name: string;
  type: CashMovementType;
  amount: number;
  payment_method: string;
  description: string;
  created_at: string;
}

export type AccountReceivableStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface AccountReceivable {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  sale_id?: string;
  sale_number?: string;
  description: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  paid_date?: string;
  status: AccountReceivableStatus;
  installment_number: number;
  total_installments: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type ExpenseCategory = 
  | 'aluguel' 
  | 'energia' 
  | 'agua' 
  | 'internet' 
  | 'salarios' 
  | 'compras' 
  | 'transporte' 
  | 'manutencao' 
  | 'impostos' 
  | 'outros';

export interface Expense {
  id: string;
  store_id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  due_date: string;
  payment_date?: string;
  payment_method: string;
  status: 'pending' | 'paid' | 'cancelled';
  supplier_id?: string;
  supplier_name?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface DashboardMetrics {
  salesToday: number;
  salesTodayCount: number;
  salesMonth: number;
  salesMonthCount: number;
  averageTicket: number;
  productsSoldToday: number;
  lowStockCount: number;
  outOfStockCount: number;
  accountsReceivableDueToday: number;
  accountsReceivableOverdue: number;
  cashInRegister: number;
  estimatedProfitMonth: number;
  grossMarginMonth: number;
}
