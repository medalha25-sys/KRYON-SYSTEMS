-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for products (Public read)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);


-- 3. USER_PRODUCTS TABLE (Access Control)
CREATE TABLE IF NOT EXISTS public.user_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'user', -- e.g., 'admin', 'user'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- RLS for user_products
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own product access" 
ON public.user_products FOR SELECT 
USING (auth.uid() = user_id);


-- 4. SUBSCRIPTIONS TABLE (Billing/Trial)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug TEXT REFERENCES public.products(slug) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('trial', 'active', 'canceled', 'expired', 'past_due')),
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_product_slug ON public.subscriptions(product_slug);


-- 5. INITIAL DATA (Seed Products)
INSERT INTO public.products (slug, name, description) VALUES 
('reseller', 'Reseller Dashboard', 'Gestão para revendedores'), 
('mechanic', 'Mechanic Dashboard', 'Gestão para oficinas mecânicas'), 
('lawyer', 'Legal Desk', 'Gestão para advogados')
ON CONFLICT (slug) DO NOTHING;
