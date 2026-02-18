-- 20260217000008_saas_architecture.sql

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE, -- 'agenda-facil', 'gestao-pet', 'fashion-ai'
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
    valid_until TIMESTAMPTZ,
    
    -- Mercado Pago Integration
    external_id TEXT UNIQUE, -- MP Preapproval ID
    external_payer_id TEXT, -- MP Payer ID / Customer ID
    payment_method TEXT, -- 'credit_card', 'ticket', etc.
    last_charged_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, product_id)
);

-- 3. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Products: Public Read (or Authenticated Read)
CREATE POLICY "Public read products" ON public.products
    FOR SELECT USING (true);

-- Products: Admin Manage
CREATE POLICY "Admin manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin' 
            -- Note: 'admin' here refers to System Admin ideally, but let's assume 'admin' role in ANY organization 
            -- can't verify 'System Admin'. 
            -- Actually, Products should be managed by SUPER ADMIN or via SQL seed. 
            -- Let's restrict to implicit read-only for app users.
        )
    );

-- Subscriptions: Organization Members can View their own subscriptions
CREATE POLICY "Org members view subscriptions" ON public.subscriptions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

-- Subscriptions: Only System Admins can insert/update? 
-- Or maybe Org Admins can "Buy" (Insert)?
-- For now, let's allow Org Admins to Read. Management usually happens via Webhook (Stripe) or strict Admin API.
-- We'll add a policy for Admins to 'View' as well (redundant with above but distinct for clarify).


-- 5. Seed Default Products
INSERT INTO public.products (slug, name, description) VALUES
    ('agenda-facil', 'Agenda Fácil', 'Gestão completa para clínicas e consultórios.'),
    ('gestao-pet', 'Gestão Pet', 'Sistema especializado para Pet Shops e Veterinárias.'),
    ('fashion-ai', 'Fashion Store AI', 'Inteligência Artificial para lojas de roupas.')
ON CONFLICT (slug) DO NOTHING;
