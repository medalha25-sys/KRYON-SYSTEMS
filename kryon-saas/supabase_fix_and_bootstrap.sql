-- SCRIPT MESTRE: CORRIGIR TABELAS E CRIAR ASSINATURA

-- 1. Garantir que a tabela PRODUCTS existe e está correta
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Garantir que a tabela SUBSCRIPTIONS existe e tem as colunas certas
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando (Migration Manual)
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;

-- 3. Criar o produto "Agenda Fácil"
INSERT INTO public.products (name, slug, description, active)
VALUES ('Agenda Fácil', 'agenda-facil', 'Gestão de Agendamentos', true)
ON CONFLICT (slug) DO NOTHING;

-- 4. Criar a assinatura para a "Clínica Principal"
-- Removemos qualquer assinatura antiga inválida para garantir
DELETE FROM public.subscriptions 
WHERE organization_id = (SELECT id FROM public.organizations WHERE name = 'Clínica Principal' LIMIT 1);

INSERT INTO public.subscriptions (organization_id, product_id, status, plan_type)
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Clínica Principal' LIMIT 1),
    (SELECT id FROM public.products WHERE slug = 'agenda-facil' LIMIT 1),
    'active',
    'free'
ON CONFLICT DO NOTHING;

-- 5. Conferência
SELECT 
    org.name as clinica, 
    prod.name as produto, 
    sub.status,
    sub.plan_type
FROM public.subscriptions sub
JOIN public.organizations org ON sub.organization_id = org.id
JOIN public.products prod ON sub.product_id = prod.id;
