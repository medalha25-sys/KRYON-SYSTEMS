import { 
  Store, Profile, Category, Supplier, Customer, Product, 
  StockMovement, Sale, SaleItem, CashRegister, CashMovement, 
  AccountReceivable, Expense, DashboardMetrics, StockMovementType,
  PaymentEntry, SaleStatus
} from './types';
import { 
  INITIAL_STORE, INITIAL_PROFILES, INITIAL_CATEGORIES, 
  INITIAL_SUPPLIERS, INITIAL_CUSTOMERS, INITIAL_PRODUCTS, 
  INITIAL_CASH_REGISTERS, INITIAL_SALES, INITIAL_STOCK_MOVEMENTS, 
  INITIAL_ACCOUNTS_RECEIVABLE, INITIAL_EXPENSES 
} from '../seed-data';
import { supabase, isSupabaseConfigured } from '../supabase/client';

// Chaves de armazenamento local
const KEYS = {
  DATA_VERSION: 'utillar_data_version',
  STORES: 'utillar_stores',
  PROFILES: 'utillar_profiles',
  CATEGORIES: 'utillar_categories',
  SUPPLIERS: 'utillar_suppliers',
  CUSTOMERS: 'utillar_customers',
  PRODUCTS: 'utillar_products',
  STOCK_MOVEMENTS: 'utillar_stock_movements',
  CASH_REGISTERS: 'utillar_cash_registers',
  CASH_MOVEMENTS: 'utillar_cash_movements',
  SALES: 'utillar_sales',
  ACCOUNTS_RECEIVABLE: 'utillar_accounts_receivable',
  EXPENSES: 'utillar_expenses',
  CURRENT_USER_ID: 'utillar_active_user_id',
  CURRENT_STORE_ID: 'utillar_active_store_id'
};

// Funções utilitárias seguras para LocalStorage (com fallback para memória no SSR)
class StorageManager {
  private memory: Record<string, any> = {};

  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
      return this.memory[key] !== undefined ? this.memory[key] : defaultValue;
    }
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        this.set(key, defaultValue);
        return defaultValue;
      }
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      this.memory[key] = value;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }

  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    this.memory = {};
  }
}

const storage = new StorageManager();

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.initSeedData();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Inicializa dados limpos para produção
  public initSeedData(): void {
    if (typeof window === 'undefined') return;

    const currentVersion = localStorage.getItem(KEYS.DATA_VERSION);
    if (currentVersion !== 'v7_medalha25_adm') {
      // Atualiza catálogo de produtos, categorias e perfis (incluindo Wesley Medalha ADM Geral)
      storage.set(KEYS.PRODUCTS, INITIAL_PRODUCTS);
      storage.set(KEYS.CATEGORIES, INITIAL_CATEGORIES);
      storage.set(KEYS.PROFILES, INITIAL_PROFILES);
      storage.set(KEYS.STORES, [INITIAL_STORE]);
      storage.set(KEYS.CURRENT_STORE_ID, INITIAL_STORE.id);

      // Mantém histórico operacional limpo se ainda não iniciado
      if (!localStorage.getItem(KEYS.SALES)) storage.set(KEYS.SALES, []);
      if (!localStorage.getItem(KEYS.STOCK_MOVEMENTS)) storage.set(KEYS.STOCK_MOVEMENTS, []);
      if (!localStorage.getItem(KEYS.CASH_REGISTERS)) storage.set(KEYS.CASH_REGISTERS, []);
      if (!localStorage.getItem(KEYS.CASH_MOVEMENTS)) storage.set(KEYS.CASH_MOVEMENTS, []);
      if (!localStorage.getItem(KEYS.ACCOUNTS_RECEIVABLE)) storage.set(KEYS.ACCOUNTS_RECEIVABLE, []);
      if (!localStorage.getItem(KEYS.EXPENSES)) storage.set(KEYS.EXPENSES, []);
      if (!localStorage.getItem(KEYS.CUSTOMERS)) storage.set(KEYS.CUSTOMERS, []);
      if (!localStorage.getItem(KEYS.SUPPLIERS)) storage.set(KEYS.SUPPLIERS, []);

      localStorage.setItem(KEYS.DATA_VERSION, 'v7_medalha25_adm');
      return;
    }

    if (!localStorage.getItem(KEYS.STORES)) {
      storage.set(KEYS.STORES, [INITIAL_STORE]);
    }
    if (!localStorage.getItem(KEYS.PROFILES)) {
      storage.set(KEYS.PROFILES, INITIAL_PROFILES);
    }
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      storage.set(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(KEYS.SUPPLIERS)) {
      storage.set(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    }
    if (!localStorage.getItem(KEYS.CUSTOMERS)) {
      storage.set(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      storage.set(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(KEYS.CASH_REGISTERS)) {
      storage.set(KEYS.CASH_REGISTERS, INITIAL_CASH_REGISTERS);
    }
    if (!localStorage.getItem(KEYS.SALES)) {
      storage.set(KEYS.SALES, INITIAL_SALES);
    }
    if (!localStorage.getItem(KEYS.STOCK_MOVEMENTS)) {
      storage.set(KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
    }
    if (!localStorage.getItem(KEYS.ACCOUNTS_RECEIVABLE)) {
      storage.set(KEYS.ACCOUNTS_RECEIVABLE, INITIAL_ACCOUNTS_RECEIVABLE);
    }
    if (!localStorage.getItem(KEYS.EXPENSES)) {
      storage.set(KEYS.EXPENSES, INITIAL_EXPENSES);
    }
    if (!localStorage.getItem(KEYS.CURRENT_STORE_ID)) {
      storage.set(KEYS.CURRENT_STORE_ID, INITIAL_STORE.id);
    }
    if (!localStorage.getItem(KEYS.CURRENT_USER_ID)) {
      storage.set(KEYS.CURRENT_USER_ID, INITIAL_PROFILES[0].id);
    }
  }

  // Limpar todos os dados operacionais (Vendas, Estoque, Caixa, Despesas, Clientes)
  public clearAllTestData(storeId = 'store-1'): void {
    storage.set(KEYS.PRODUCTS, []);
    storage.set(KEYS.SALES, []);
    storage.set(KEYS.STOCK_MOVEMENTS, []);
    storage.set(KEYS.CASH_REGISTERS, []);
    storage.set(KEYS.CASH_MOVEMENTS, []);
    storage.set(KEYS.ACCOUNTS_RECEIVABLE, []);
    storage.set(KEYS.EXPENSES, []);
    storage.set(KEYS.CUSTOMERS, []);
    storage.set(KEYS.SUPPLIERS, []);
  }

  // Resetar dados para o padrão limpo de fábrica
  public resetToFactory(): void {
    storage.clear();
    localStorage.removeItem(KEYS.DATA_VERSION);
    this.initSeedData();
  }

  // ==========================================
  // LOJAS (STORES)
  // ==========================================
  public getStore(storeId = 'store-1'): Store {
    const stores = storage.get<Store[]>(KEYS.STORES, [INITIAL_STORE]);
    const store = stores.find(s => s.id === storeId);
    return store || stores[0] || INITIAL_STORE;
  }

  public updateStore(storeId: string, data: Partial<Store>): Store {
    const stores = storage.get<Store[]>(KEYS.STORES, [INITIAL_STORE]);
    const index = stores.findIndex(s => s.id === storeId);
    if (index === -1) throw new Error('Loja não encontrada');

    const updated = { ...stores[index], ...data, updated_at: new Date().toISOString() };
    stores[index] = updated;
    storage.set(KEYS.STORES, stores);
    return updated;
  }

  // ==========================================
  // USUÁRIOS & PERFIS
  // ==========================================
  public getProfiles(storeId = 'store-1'): Profile[] {
    let profiles = storage.get<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
    const suriel = profiles.find(p => p.email === 'suriel@donalar.com.br');
    const elizangela = profiles.find(p => p.email === 'elizangela@donalar.com.br');
    
    // Se o papel de Elizangela não for vendedora ou Suriel não for admin, atualiza para o estado correto
    if (!suriel || suriel.role !== 'admin' || !elizangela || elizangela.role !== 'vendedor') {
      profiles = INITIAL_PROFILES;
      storage.set(KEYS.PROFILES, profiles);
    }
    return profiles.filter(p => p.store_id === storeId && p.active);
  }

  public getProfileById(userId: string): Profile | null {
    const profiles = storage.get<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
    return profiles.find(p => p.id === userId) || null;
  }

  public createProfile(profile: Omit<Profile, 'id' | 'created_at'>): Profile {
    const profiles = storage.get<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
    const newProfile: Profile = {
      ...profile,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    profiles.push(newProfile);
    storage.set(KEYS.PROFILES, profiles);
    return newProfile;
  }

  public updateProfile(id: string, data: Partial<Profile>): Profile {
    const profiles = storage.get<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Usuário não encontrado');

    const updated = { ...profiles[index], ...data };
    profiles[index] = updated;
    storage.set(KEYS.PROFILES, profiles);
    return updated;
  }

  public deleteProfile(id: string): void {
    const profiles = storage.get<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
    const filtered = profiles.filter(p => p.id !== id);
    storage.set(KEYS.PROFILES, filtered);
  }

  // ==========================================
  // CATEGORIAS
  // ==========================================
  public getCategories(storeId = 'store-1'): Category[] {
    const categories = storage.get<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return categories.filter(c => c.store_id === storeId && c.active);
  }

  public addCategory(cat: Omit<Category, 'id' | 'created_at'>): Category {
    const categories = storage.get<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    categories.push(newCat);
    storage.set(KEYS.CATEGORIES, categories);
    return newCat;
  }

  public updateCategory(id: string, data: Partial<Category>): Category {
    const categories = storage.get<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Categoria não encontrada');

    const updated = { ...categories[index], ...data };
    categories[index] = updated;
    storage.set(KEYS.CATEGORIES, categories);
    return updated;
  }

  public deleteCategory(id: string): void {
    const categories = storage.get<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const filtered = categories.filter(c => c.id !== id);
    storage.set(KEYS.CATEGORIES, filtered);
  }

  // ==========================================
  // FORNECEDORES
  // ==========================================
  public getSuppliers(storeId = 'store-1'): Supplier[] {
    const suppliers = storage.get<Supplier[]>(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    return suppliers.filter(s => s.store_id === storeId && s.active);
  }

  public addSupplier(supplier: Omit<Supplier, 'id' | 'created_at'>): Supplier {
    const suppliers = storage.get<Supplier[]>(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const newSup: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    suppliers.push(newSup);
    storage.set(KEYS.SUPPLIERS, suppliers);
    return newSup;
  }

  public updateSupplier(id: string, data: Partial<Supplier>): Supplier {
    const suppliers = storage.get<Supplier[]>(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Fornecedor não encontrado');

    const updated = { ...suppliers[index], ...data };
    suppliers[index] = updated;
    storage.set(KEYS.SUPPLIERS, suppliers);
    return updated;
  }

  public deleteSupplier(id: string): void {
    const suppliers = storage.get<Supplier[]>(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const filtered = suppliers.filter(s => s.id !== id);
    storage.set(KEYS.SUPPLIERS, filtered);
  }

  // ==========================================
  // CLIENTES
  // ==========================================
  public getCustomers(storeId = 'store-1'): Customer[] {
    const customers = storage.get<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    return customers.filter(c => c.store_id === storeId && c.active);
  }

  public getCustomerById(id: string): Customer | null {
    const customers = storage.get<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    return customers.find(c => c.id === id) || null;
  }

  public addCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'total_purchases' | 'credit_used'>): Customer {
    const customers = storage.get<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      total_spent: 0,
      total_purchases: 0,
      credit_used: 0,
      active: true,
      created_at: new Date().toISOString()
    };
    customers.push(newCust);
    storage.set(KEYS.CUSTOMERS, customers);
    return newCust;
  }

  public updateCustomer(id: string, data: Partial<Customer>): Customer {
    const customers = storage.get<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cliente não encontrado');

    const updated = { ...customers[index], ...data };
    customers[index] = updated;
    storage.set(KEYS.CUSTOMERS, customers);
    return updated;
  }

  public deleteCustomer(id: string): void {
    const customers = storage.get<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const filtered = customers.filter(c => c.id !== id);
    storage.set(KEYS.CUSTOMERS, filtered);
  }

  // ==========================================
  // PRODUTOS
  // ==========================================
  public getProducts(storeId = 'store-1'): Product[] {
    const products = storage.get<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.filter(p => p.store_id === storeId && p.active);
  }

  public getProductById(id: string): Product | null {
    const products = storage.get<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.find(p => p.id === id) || null;
  }

  public getProductByBarcodeOrSku(code: string, storeId = 'store-1'): Product | null {
    const products = this.getProducts(storeId);
    const cleanCode = code.trim().toLowerCase();
    return products.find(p => 
      (p.barcode && p.barcode.toLowerCase() === cleanCode) || 
      p.sku.toLowerCase() === cleanCode
    ) || null;
  }

  public addProduct(product: Omit<Product, 'id' | 'created_at' | 'profit_margin'>): Product {
    const products = storage.get<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const profitMargin = product.cost_price > 0 
      ? ((product.sale_price - product.cost_price) / product.cost_price) * 100 
      : 0;

    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      profit_margin: parseFloat(profitMargin.toFixed(2)),
      active: true,
      created_at: new Date().toISOString()
    };
    products.push(newProduct);
    storage.set(KEYS.PRODUCTS, products);
    return newProduct;
  }

  public updateProduct(id: string, data: Partial<Product>): Product {
    const products = storage.get<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');

    const cost = data.cost_price !== undefined ? data.cost_price : products[index].cost_price;
    const sale = data.sale_price !== undefined ? data.sale_price : products[index].sale_price;
    const profitMargin = cost > 0 ? ((sale - cost) / cost) * 100 : 0;

    const updated: Product = {
      ...products[index],
      ...data,
      profit_margin: parseFloat(profitMargin.toFixed(2)),
      updated_at: new Date().toISOString()
    };

    products[index] = updated;
    storage.set(KEYS.PRODUCTS, products);
    return updated;
  }

  public deleteProduct(id: string): void {
    const products = storage.get<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const filtered = products.filter(p => p.id !== id);
    storage.set(KEYS.PRODUCTS, filtered);
  }

  public duplicateProduct(id: string): Product {
    const orig = this.getProductById(id);
    if (!orig) throw new Error('Produto não encontrado para duplicação');

    const timestamp = Date.now();
    const newSku = `${orig.sku.split('-')[0] || 'UTL'}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    return this.addProduct({
      store_id: orig.store_id,
      category_id: orig.category_id,
      category_name: orig.category_name,
      supplier_id: orig.supplier_id,
      supplier_name: orig.supplier_name,
      sku: newSku,
      barcode: undefined,
      name: `${orig.name} (Cópia)`,
      description: orig.description,
      brand: orig.brand,
      unit: orig.unit,
      cost_price: orig.cost_price,
      sale_price: orig.sale_price,
      current_stock: 0,
      min_stock: orig.min_stock,
      max_stock: orig.max_stock,
      image_url: orig.image_url,
      active: true,
    });
  }

  // ==========================================
  // CONTROLE DE ESTOQUE (MOVIMENTAÇÕES)
  // ==========================================
  public getStockMovements(storeId = 'store-1'): StockMovement[] {
    const movements = storage.get<StockMovement[]>(KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
    return movements.filter(m => m.store_id === storeId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public recordStockMovement(params: {
    store_id: string;
    product_id: string;
    user_id: string;
    user_name: string;
    type: StockMovementType;
    quantity: number;
    reason: string;
    notes?: string;
    sale_id?: string;
  }): StockMovement {
    const product = this.getProductById(params.product_id);
    if (!product) throw new Error('Produto não encontrado');

    const prevStock = product.current_stock;
    let newStock = prevStock;

    if (params.type === 'entrada' || params.type === 'devolucao') {
      newStock += params.quantity;
    } else if (params.type === 'saida' || params.type === 'perda') {
      newStock = Math.max(0, newStock - params.quantity);
    } else if (params.type === 'ajuste' || params.type === 'inventario') {
      newStock = params.quantity; // Ajuste direto para a quantidade contada
    }

    // Atualiza produto
    this.updateProduct(product.id, { current_stock: newStock });

    // Registra movimento
    const movements = storage.get<StockMovement[]>(KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      store_id: params.store_id,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      user_id: params.user_id,
      user_name: params.user_name,
      sale_id: params.sale_id,
      type: params.type,
      quantity: params.quantity,
      previous_stock: prevStock,
      new_stock: newStock,
      cost_price: product.cost_price,
      reason: params.reason,
      notes: params.notes,
      created_at: new Date().toISOString()
    };

    movements.unshift(movement);
    storage.set(KEYS.STOCK_MOVEMENTS, movements);
    return movement;
  }

  // ==========================================
  // CAIXA (CASH REGISTERS & MOVEMENTS)
  // ==========================================
  public getOpenCashRegister(storeId = 'store-1'): CashRegister | null {
    const registers = storage.get<CashRegister[]>(KEYS.CASH_REGISTERS, INITIAL_CASH_REGISTERS);
    return registers.find(r => r.store_id === storeId && r.status === 'open') || null;
  }

  public getCashRegisters(storeId = 'store-1'): CashRegister[] {
    const registers = storage.get<CashRegister[]>(KEYS.CASH_REGISTERS, INITIAL_CASH_REGISTERS);
    return registers.filter(r => r.store_id === storeId).sort((a, b) => 
      new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime()
    );
  }

  public openCashRegister(params: {
    store_id: string;
    user_id: string;
    user_name: string;
    initial_float: number;
    notes?: string;
  }): CashRegister {
    const currentOpen = this.getOpenCashRegister(params.store_id);
    if (currentOpen) throw new Error('Já existe um caixa aberto para esta loja.');

    const registers = storage.get<CashRegister[]>(KEYS.CASH_REGISTERS, INITIAL_CASH_REGISTERS);
    const newRegister: CashRegister = {
      id: `cash-${Date.now()}`,
      store_id: params.store_id,
      user_id: params.user_id,
      user_name: params.user_name,
      opened_at: new Date().toISOString(),
      initial_float: params.initial_float,
      status: 'open',
      notes: params.notes,
      created_at: new Date().toISOString()
    };

    registers.unshift(newRegister);
    storage.set(KEYS.CASH_REGISTERS, registers);

    // Registra movimento de suprimento inicial
    this.addCashMovement({
      cash_register_id: newRegister.id,
      store_id: params.store_id,
      user_id: params.user_id,
      user_name: params.user_name,
      type: 'suprimento',
      amount: params.initial_float,
      payment_method: 'dinheiro',
      description: 'Abertura de Caixa (Fundo de Troco)'
    });

    return newRegister;
  }

  public closeCashRegister(params: {
    cash_register_id: string;
    closing_cash_counted: number;
    notes?: string;
  }): CashRegister {
    const registers = storage.get<CashRegister[]>(KEYS.CASH_REGISTERS, INITIAL_CASH_REGISTERS);
    const index = registers.findIndex(r => r.id === params.cash_register_id);
    if (index === -1) throw new Error('Caixa não encontrado');

    const reg = registers[index];
    const movements = this.getCashMovements(reg.id);

    // Calcula total esperado em dinheiro no caixa
    let expectedCash = reg.initial_float;
    movements.forEach(m => {
      if (m.payment_method.toLowerCase() === 'dinheiro') {
        if (m.type === 'suprimento' || m.type === 'venda' || m.type === 'recebimento') {
          expectedCash += m.amount;
        } else if (m.type === 'sangria' || m.type === 'despesa' || m.type === 'estorno') {
          expectedCash -= m.amount;
        }
      }
    });

    const difference = params.closing_cash_counted - expectedCash;

    const updated: CashRegister = {
      ...reg,
      closed_at: new Date().toISOString(),
      closing_cash_counted: params.closing_cash_counted,
      closing_cash_expected: expectedCash,
      difference: difference,
      status: 'closed',
      notes: params.notes,
    };

    registers[index] = updated;
    storage.set(KEYS.CASH_REGISTERS, registers);
    return updated;
  }

  public getCashMovements(cashRegisterId: string): CashMovement[] {
    const movements = storage.get<CashMovement[]>(KEYS.CASH_MOVEMENTS, []);
    return movements.filter(m => m.cash_register_id === cashRegisterId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public addCashMovement(movement: Omit<CashMovement, 'id' | 'created_at'>): CashMovement {
    const movements = storage.get<CashMovement[]>(KEYS.CASH_MOVEMENTS, []);
    const newMovement: CashMovement = {
      ...movement,
      id: `cmov-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    movements.unshift(newMovement);
    storage.set(KEYS.CASH_MOVEMENTS, movements);
    return newMovement;
  }

  // ==========================================
  // VENDAS (PDV TRANSACTION ENGINE)
  // ==========================================
  public getSales(storeId = 'store-1'): Sale[] {
    const sales = storage.get<Sale[]>(KEYS.SALES, INITIAL_SALES);
    return sales.filter(s => s.store_id === storeId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getSaleById(id: string): Sale | null {
    const sales = storage.get<Sale[]>(KEYS.SALES, INITIAL_SALES);
    return sales.find(s => s.id === id) || null;
  }

  public createSale(params: {
    store_id: string;
    customer_id?: string;
    customer_name?: string;
    customer_document?: string;
    cashier_id: string;
    cashier_name: string;
    items: SaleItem[];
    discount: number;
    discount_type: 'value' | 'percent';
    payments: PaymentEntry[];
    notes?: string;
  }): Sale {
    const openRegister = this.getOpenCashRegister(params.store_id);

    // Calcular totais e custos
    let subtotal = 0;
    let totalCost = 0;
    params.items.forEach(item => {
      subtotal += item.total_price;
      totalCost += (item.cost_price || 0) * item.quantity;
    });

    let discountValue = 0;
    if (params.discount_type === 'percent') {
      discountValue = (subtotal * params.discount) / 100;
    } else {
      discountValue = params.discount;
    }

    const total = Math.max(0, subtotal - discountValue);

    // Determinar resumo das formas de pagamento
    const paymentMethodsSummary = params.payments
      .map(p => {
        if (p.method === 'credito' && p.installments && p.installments > 1) {
          return `Crédito (${p.installments}x)`;
        }
        if (p.method === 'dinheiro') return 'Dinheiro';
        if (p.method === 'pix') return 'PIX';
        if (p.method === 'debito') return 'Débito';
        if (p.method === 'fiado') return 'Fiado';
        return p.method.toUpperCase();
      })
      .join(' + ');

    const saleNumber = `VD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      store_id: params.store_id,
      cash_register_id: openRegister?.id,
      sale_number: saleNumber,
      customer_id: params.customer_id,
      customer_name: params.customer_name || 'Cliente Balcão',
      customer_document: params.customer_document,
      cashier_id: params.cashier_id,
      cashier_name: params.cashier_name,
      subtotal: subtotal,
      discount: discountValue,
      discount_type: params.discount_type,
      total: total,
      total_cost: totalCost,
      payment_method: paymentMethodsSummary,
      payments: params.payments,
      items: params.items,
      status: 'completed',
      notes: params.notes,
      created_at: new Date().toISOString()
    };

    // 1. Salvar Venda
    const sales = storage.get<Sale[]>(KEYS.SALES, INITIAL_SALES);
    sales.unshift(newSale);
    storage.set(KEYS.SALES, sales);

    // 2. Baixar estoque e criar logs de movimentação para cada item
    params.items.forEach(item => {
      this.recordStockMovement({
        store_id: params.store_id,
        product_id: item.product_id,
        user_id: params.cashier_id,
        user_name: params.cashier_name,
        type: 'saida',
        quantity: item.quantity,
        reason: `Venda ${saleNumber}`,
        sale_id: newSale.id
      });
    });

    // 3. Registrar movimentação no caixa para cada pagamento em dinheiro ou outros
    if (openRegister) {
      params.payments.forEach(p => {
        this.addCashMovement({
          cash_register_id: openRegister.id,
          store_id: params.store_id,
          user_id: params.cashier_id,
          user_name: params.cashier_name,
          type: 'venda',
          amount: p.amount,
          payment_method: p.method,
          description: `Venda ${saleNumber} (${p.method.toUpperCase()})`
        });
      });
    }

    // 4. Se tiver pagamento em fiado, registrar Contas a Receber
    params.payments.forEach(p => {
      if (p.method === 'fiado' && params.customer_id) {
        this.addAccountReceivable({
          store_id: params.store_id,
          customer_id: params.customer_id,
          customer_name: params.customer_name || 'Cliente',
          sale_id: newSale.id,
          sale_number: saleNumber,
          description: `Venda ${saleNumber} a prazo`,
          amount: p.amount,
          due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'pending',
          installment_number: 1,
          total_installments: 1
        });
      }
    });

    // 5. Atualizar histórico do cliente se informado
    if (params.customer_id) {
      const customer = this.getCustomerById(params.customer_id);
      if (customer) {
        this.updateCustomer(customer.id, {
          total_spent: customer.total_spent + total,
          total_purchases: customer.total_purchases + 1
        });
      }
    }

    return newSale;
  }

  public cancelSale(saleId: string, reason: string, userId: string, userName: string): Sale {
    const sales = storage.get<Sale[]>(KEYS.SALES, INITIAL_SALES);
    const index = sales.findIndex(s => s.id === saleId);
    if (index === -1) throw new Error('Venda não encontrada');

    const sale = sales[index];
    if (sale.status === 'cancelled') throw new Error('Esta venda já está cancelada');

    // 1. Marcar como cancelada
    sale.status = 'cancelled';
    sale.notes = sale.notes ? `${sale.notes} | Cancelada: ${reason}` : `Cancelada: ${reason}`;
    sale.updated_at = new Date().toISOString();
    sales[index] = sale;
    storage.set(KEYS.SALES, sales);

    // 2. Devolver produtos ao estoque automaticamente
    sale.items.forEach(item => {
      this.recordStockMovement({
        store_id: sale.store_id,
        product_id: item.product_id,
        user_id: userId,
        user_name: userName,
        type: 'devolucao',
        quantity: item.quantity,
        reason: `Cancelamento da Venda ${sale.sale_number} - Motivo: ${reason}`,
        sale_id: sale.id
      });
    });

    // 3. Estorno no caixa se houver caixa aberto
    const openRegister = this.getOpenCashRegister(sale.store_id);
    if (openRegister) {
      sale.payments.forEach(p => {
        this.addCashMovement({
          cash_register_id: openRegister.id,
          store_id: sale.store_id,
          user_id: userId,
          user_name: userName,
          type: 'estorno',
          amount: p.amount,
          payment_method: p.method,
          description: `Estorno Venda ${sale.sale_number} - ${reason}`
        });
      });
    }

    // 4. Cancelar contas a receber associadas, se houver
    const receivables = storage.get<AccountReceivable[]>(KEYS.ACCOUNTS_RECEIVABLE, INITIAL_ACCOUNTS_RECEIVABLE);
    const updatedReceivables = receivables.map(r => {
      if (r.sale_id === sale.id) {
        return { ...r, status: 'cancelled' as const, notes: `Venda cancelada: ${reason}` };
      }
      return r;
    });
    storage.set(KEYS.ACCOUNTS_RECEIVABLE, updatedReceivables);

    // 5. Ajustar histórico do cliente
    if (sale.customer_id) {
      const customer = this.getCustomerById(sale.customer_id);
      if (customer) {
        this.updateCustomer(customer.id, {
          total_spent: Math.max(0, customer.total_spent - sale.total),
          total_purchases: Math.max(0, customer.total_purchases - 1)
        });
      }
    }

    return sale;
  }

  // ==========================================
  // CONTAS A RECEBER (FIADO)
  // ==========================================
  public getAccountsReceivable(storeId = 'store-1'): AccountReceivable[] {
    const items = storage.get<AccountReceivable[]>(KEYS.ACCOUNTS_RECEIVABLE, INITIAL_ACCOUNTS_RECEIVABLE);
    const today = new Date().toISOString().split('T')[0];

    // Atualiza status para overdue se passou do vencimento e está pendente
    return items.filter(i => i.store_id === storeId).map((item): AccountReceivable => {
      if (item.status === 'pending' && item.due_date < today) {
        return { ...item, status: 'overdue' as const };
      }
      return item;
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  public addAccountReceivable(ar: Omit<AccountReceivable, 'id' | 'created_at' | 'amount_paid'>): AccountReceivable {
    const list = storage.get<AccountReceivable[]>(KEYS.ACCOUNTS_RECEIVABLE, INITIAL_ACCOUNTS_RECEIVABLE);
    const newAr: AccountReceivable = {
      ...ar,
      id: `ar-${Date.now()}`,
      amount_paid: 0,
      created_at: new Date().toISOString()
    };
    list.push(newAr);
    storage.set(KEYS.ACCOUNTS_RECEIVABLE, list);
    return newAr;
  }

  public payAccountReceivable(params: {
    id: string;
    amount: number;
    payment_method: string;
    userId: string;
    userName: string;
  }): AccountReceivable {
    const list = storage.get<AccountReceivable[]>(KEYS.ACCOUNTS_RECEIVABLE, INITIAL_ACCOUNTS_RECEIVABLE);
    const index = list.findIndex(a => a.id === params.id);
    if (index === -1) throw new Error('Conta a receber não encontrada');

    const item = list[index];
    const totalPaid = item.amount_paid + params.amount;
    const isFullyPaid = totalPaid >= item.amount;

    const updated: AccountReceivable = {
      ...item,
      amount_paid: totalPaid,
      status: isFullyPaid ? 'paid' : item.status,
      paid_date: isFullyPaid ? new Date().toISOString() : item.paid_date,
      updated_at: new Date().toISOString()
    };

    list[index] = updated;
    storage.set(KEYS.ACCOUNTS_RECEIVABLE, list);

    // Entrada no caixa aberto se houver
    const openRegister = this.getOpenCashRegister(item.store_id);
    if (openRegister) {
      this.addCashMovement({
        cash_register_id: openRegister.id,
        store_id: item.store_id,
        user_id: params.userId,
        user_name: params.userName,
        type: 'recebimento',
        amount: params.amount,
        payment_method: params.payment_method,
        description: `Recebimento Fiado: ${item.customer_name} (${item.description})`
      });
    }

    return updated;
  }

  // ==========================================
  // DESPESAS (EXPENSES)
  // ==========================================
  public getExpenses(storeId = 'store-1'): Expense[] {
    const expenses = storage.get<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
    return expenses.filter(e => e.store_id === storeId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Expense {
    const list = storage.get<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    list.push(newExp);
    storage.set(KEYS.EXPENSES, list);
    return newExp;
  }

  public payExpense(id: string, paymentMethod: string, userId: string, userName: string): Expense {
    const list = storage.get<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
    const index = list.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Despesa não encontrada');

    const exp = list[index];
    const updated: Expense = {
      ...exp,
      status: 'paid',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethod,
      updated_at: new Date().toISOString()
    };

    list[index] = updated;
    storage.set(KEYS.EXPENSES, list);

    // Se pago em dinheiro do caixa, registra despesa no caixa aberto
    if (paymentMethod.toLowerCase() === 'dinheiro') {
      const openRegister = this.getOpenCashRegister(exp.store_id);
      if (openRegister) {
        this.addCashMovement({
          cash_register_id: openRegister.id,
          store_id: exp.store_id,
          user_id: userId,
          user_name: userName,
          type: 'despesa',
          amount: exp.amount,
          payment_method: 'dinheiro',
          description: `Despesa Paga: ${exp.description}`
        });
      }
    }

    return updated;
  }

  public deleteExpense(id: string): void {
    const list = storage.get<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
    const filtered = list.filter(e => e.id !== id);
    storage.set(KEYS.EXPENSES, filtered);
  }

  // ==========================================
  // DASHBOARD & MÉTRICAS
  // ==========================================
  public getDashboardMetrics(storeId = 'store-1'): DashboardMetrics {
    const sales = this.getSales(storeId).filter(s => s.status === 'completed');
    const products = this.getProducts(storeId);
    const receivables = this.getAccountsReceivable(storeId);
    const openRegister = this.getOpenCashRegister(storeId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Vendas de hoje
    const salesToday = sales.filter(s => s.created_at.startsWith(todayStr));
    const salesTodayTotal = salesToday.reduce((acc, s) => acc + s.total, 0);
    const productsSoldToday = salesToday.reduce((acc, s) => 
      acc + s.items.reduce((sum, item) => sum + item.quantity, 0), 0
    );

    // Vendas do mês
    const salesMonth = sales.filter(s => {
      const d = new Date(s.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const salesMonthTotal = salesMonth.reduce((acc, s) => acc + s.total, 0);
    const totalCostMonth = salesMonth.reduce((acc, s) => acc + s.total_cost, 0);
    const estimatedProfitMonth = salesMonthTotal - totalCostMonth;
    const grossMarginMonth = salesMonthTotal > 0 ? (estimatedProfitMonth / salesMonthTotal) * 100 : 0;
    const averageTicket = salesMonth.length > 0 ? salesMonthTotal / salesMonth.length : 0;

    // Estoque crítico
    const lowStockCount = products.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock).length;
    const outOfStockCount = products.filter(p => p.current_stock <= 0).length;

    // Contas a receber
    const receivablesDueToday = receivables
      .filter(r => r.status === 'pending' && r.due_date === todayStr)
      .reduce((acc, r) => acc + (r.amount - r.amount_paid), 0);

    const receivablesOverdue = receivables
      .filter(r => r.status === 'overdue')
      .reduce((acc, r) => acc + (r.amount - r.amount_paid), 0);

    // Saldo em caixa
    let cashInRegister = 0;
    if (openRegister) {
      cashInRegister = openRegister.initial_float;
      const movements = this.getCashMovements(openRegister.id);
      movements.forEach(m => {
        if (m.payment_method.toLowerCase() === 'dinheiro') {
          if (m.type === 'suprimento' || m.type === 'venda' || m.type === 'recebimento') {
            cashInRegister += m.amount;
          } else if (m.type === 'sangria' || m.type === 'despesa' || m.type === 'estorno') {
            cashInRegister -= m.amount;
          }
        }
      });
    }

    return {
      salesToday: salesTodayTotal,
      salesTodayCount: salesToday.length,
      salesMonth: salesMonthTotal,
      salesMonthCount: salesMonth.length,
      averageTicket: averageTicket,
      productsSoldToday: productsSoldToday,
      lowStockCount: lowStockCount,
      outOfStockCount: outOfStockCount,
      accountsReceivableDueToday: receivablesDueToday,
      accountsReceivableOverdue: receivablesOverdue,
      cashInRegister: cashInRegister,
      estimatedProfitMonth: estimatedProfitMonth,
      grossMarginMonth: grossMarginMonth
    };
  }
}

export const db = DatabaseService.getInstance();
