-- ==============================================================================
-- SCHEMA POSTGRESQL / SUPABASE — SISTEMA DE GESTÃO DE UTILIDADES DO LAR
-- Multi-tenant pronto para SaaS com Row Level Security (RLS) e isolamento store_id
-- ==============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. LOJAS (STORES / TENANTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cnpj_cpf VARCHAR(20),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(255),
    number VARCHAR(20),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2) DEFAULT 'SP',
    zip_code VARCHAR(10),
    logo_url TEXT,
    receipt_message TEXT DEFAULT 'Obrigado pela preferência! Volte sempre.',
    currency VARCHAR(3) DEFAULT 'BRL',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. PERFIS DE USUÁRIO (PROFILES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- referencia auth.users(id) no Supabase Auth
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'gerente', 'vendedor', 'caixa')),
    avatar_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. CATEGORIAS DE PRODUTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100),
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Package',
    color VARCHAR(20) DEFAULT '#16a34a',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. FORNECEDORES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cnpj_cpf VARCHAR(20),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. CLIENTES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(20),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(255),
    number VARCHAR(20),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    notes TEXT,
    total_spent NUMERIC(12,2) DEFAULT 0.00,
    total_purchases INTEGER DEFAULT 0,
    credit_limit NUMERIC(12,2) DEFAULT 500.00,
    credit_used NUMERIC(12,2) DEFAULT 0.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. PRODUTOS (POTES, VASILHAS, PANELAS, ETC)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    sku VARCHAR(50) NOT NULL,
    barcode VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'unidade' CHECK (unit IN ('unidade', 'kit', 'caixa', 'pacote', 'duzia')),
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    profit_margin NUMERIC(8,2) GENERATED ALWAYS AS (
        CASE WHEN cost_price > 0 THEN ((sale_price - cost_price) / cost_price) * 100 ELSE 0 END
    ) STORED,
    current_stock NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    min_stock NUMERIC(12,2) NOT NULL DEFAULT 5.00,
    max_stock NUMERIC(12,2) DEFAULT 100.00,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_store_sku UNIQUE(store_id, sku)
);

-- ==============================================================================
-- 7. CAIXA (CASH REGISTERS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    initial_float NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    closing_cash_counted NUMERIC(12,2),
    closing_cash_expected NUMERIC(12,2),
    difference NUMERIC(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. MOVIMENTAÇÕES DE CAIXA (SANGRIA, SUPRIMENTO, ETC)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_register_id UUID NOT NULL REFERENCES public.cash_registers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sangria', 'suprimento', 'venda', 'despesa', 'recebimento', 'estorno')),
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'dinheiro',
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. VENDAS (SALES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    cash_register_id UUID REFERENCES public.cash_registers(id) ON DELETE SET NULL,
    sale_number VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    cashier_id UUID NOT NULL,
    cashier_name VARCHAR(255) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount_type VARCHAR(10) DEFAULT 'value' CHECK (discount_type IN ('value', 'percent')),
    total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. ITENS DA VENDA (SALE ITEMS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    quantity NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0.00,
    total_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. PAGAMENTOS DA VENDA (PAYMENTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('dinheiro', 'pix', 'debito', 'credito', 'fiado', 'outro')),
    amount NUMERIC(12,2) NOT NULL,
    installments INTEGER DEFAULT 1,
    change_amount NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. MOVIMENTAÇÕES DE ESTOQUE (STOCK MOVEMENTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida', 'ajuste', 'perda', 'devolucao', 'inventario')),
    quantity NUMERIC(12,2) NOT NULL,
    previous_stock NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    new_stock NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12,2) DEFAULT 0.00,
    reason VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. CONTAS A RECEBER / FIADO (ACCOUNTS RECEIVABLE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    amount_paid NUMERIC(12,2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    paid_date TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    installment_number INTEGER DEFAULT 1,
    total_installments INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 14. DESPESAS DA LOJA (EXPENSES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('aluguel', 'energia', 'agua', 'internet', 'salarios', 'compras', 'transporte', 'manutencao', 'impostos', 'outros')),
    amount NUMERIC(12,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_method VARCHAR(20) DEFAULT 'pix',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_sales_store_id ON public.sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_store ON public.stock_movements(store_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_store ON public.accounts_receivable(store_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_customer ON public.accounts_receivable(customer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_store ON public.expenses(store_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_register ON public.cash_movements(cash_register_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) MULTI-TENANT
-- ==============================================================================
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Helper function: Obter store_id do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_current_store_id()
RETURNS UUID AS $$
    SELECT store_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas de isolamento RLS (Tenant isolation)
CREATE POLICY "Tenant isolation for stores" ON public.stores
    FOR ALL USING (id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for profiles" ON public.profiles
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for categories" ON public.categories
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for suppliers" ON public.suppliers
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for customers" ON public.customers
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for products" ON public.products
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for cash_registers" ON public.cash_registers
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for cash_movements" ON public.cash_movements
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for sales" ON public.sales
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for sale_items" ON public.sale_items
    FOR ALL USING (sale_id IN (SELECT id FROM public.sales WHERE store_id = public.get_current_store_id()));

CREATE POLICY "Tenant isolation for payments" ON public.payments
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for stock_movements" ON public.stock_movements
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for accounts_receivable" ON public.accounts_receivable
    FOR ALL USING (store_id = public.get_current_store_id());

CREATE POLICY "Tenant isolation for expenses" ON public.expenses
    FOR ALL USING (store_id = public.get_current_store_id());
