-- ESQUEMA DO MÓDULO FINANCEIRO

-- 1. CATEGORIAS DE TRANSAÇÃO
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  icon TEXT, -- Nome do símbolo Material Design
  color TEXT, -- Cor Hexadecimal
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Políticas de Segurança)
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam suas próprias categorias" ON public.financial_categories 
  USING (tenant_id = auth.uid());

-- 2. TRANSAÇÕES (Receitas e Despesas)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'canceled')),
  payment_method TEXT CHECK (payment_method IN ('money', 'credit', 'debit', 'pix', 'transfer', 'other')),
  
  -- Campos genéricos para vincular a outras entidades
  reference_id UUID, -- Pode ser appointment_id, service_order_id, etc.
  reference_type TEXT, -- 'appointment', 'service_order', 'manual'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Políticas de Segurança)
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam suas próprias transações" ON public.financial_transactions 
  USING (tenant_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON public.financial_transactions(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.financial_transactions(category_id);


-- 3. FUNÇÃO DE SEED DE CATEGORIAS PADRÃO
CREATE OR REPLACE FUNCTION public.seed_financial_categories(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Categorias de Receita
  INSERT INTO public.financial_categories (tenant_id, name, type, icon, color) VALUES
  (user_id, 'Serviços', 'income', 'cut', '#4ade80'),
  (user_id, 'Venda de Produtos', 'income', 'shopping_bag', '#22c55e'),
  (user_id, 'Outras Receitas', 'income', 'attach_money', '#16a34a');

  -- Categorias de Despesa
  INSERT INTO public.financial_categories (tenant_id, name, type, icon, color) VALUES
  (user_id, 'Aluguel/Condomínio', 'expense', 'apartment', '#ef4444'),
  (user_id, 'Energia/Água/Internet', 'expense', 'bolt', '#f87171'),
  (user_id, 'Fornecedores', 'expense', 'local_shipping', '#dc2626'),
  (user_id, 'Salários/Comissões', 'expense', 'groups', '#b91c1c'),
  (user_id, 'Marketing', 'expense', 'campaign', '#991b1b'),
  (user_id, 'Outras Despesas', 'expense', 'receipt_long', '#7f1d1d');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
