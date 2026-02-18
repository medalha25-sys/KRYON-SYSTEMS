-- 20260217000005_financial_module.sql

-- 1. Financial Categories
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  icon TEXT, 
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Financial Transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'canceled')),
  payment_method TEXT CHECK (payment_method IN ('money', 'credit', 'debit', 'pix', 'transfer', 'other')),
  
  -- Links
  professional_id UUID REFERENCES public.agenda_professionals(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.agenda_appointments(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fin_trans_org_date ON public.financial_transactions(organization_id, date);
CREATE INDEX IF NOT EXISTS idx_fin_trans_professional ON public.financial_transactions(professional_id);

-- 3. RLS Policies

-- Enable RLS
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Categories: Visible to all org members
CREATE POLICY "Org members view categories" ON public.financial_categories
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Categories: Managed by Admin/Secretary
CREATE POLICY "Admin/Secretary manage categories" ON public.financial_categories
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

-- Transactions: Admin/Secretary can View/Manage ALL
CREATE POLICY "Admin/Secretary manage all transactions" ON public.financial_transactions
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

-- Transactions: Professionals can ONLY view transactions linked to them (Commissions/Services)
CREATE POLICY "Professionals view own transactions" ON public.financial_transactions
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    professional_id IN (
        SELECT id FROM public.agenda_professionals WHERE user_id = auth.uid()
    )
  );

-- Transactions: Professionals can Create (Automatic flow)
CREATE POLICY "Professionals create transactions" ON public.financial_transactions
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    professional_id IN (
        SELECT id FROM public.agenda_professionals WHERE user_id = auth.uid()
    )
  );

-- Transactions: Professionals CANNOT create/edit/delete (ReadOnly) - Implicit by not granting ALL

-- 4. Seed Default Categories (Function trigger on Org creation ideally, but here manual or on-demand)
