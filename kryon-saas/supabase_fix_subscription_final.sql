-- SCRIPT MESTRE V2: CORRIGIR user_id E ASSINATURA

-- 1. A tabela pede 'user_id', mas em SaaS o dono é a Organização.
-- Vamos deixar 'user_id' opcional para o futuro:
ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- 2. Garantir colunas novas (caso não tenha rodado antes)
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';

-- 3. Criar o produto "Agenda Fácil"
INSERT INTO public.products (name, slug, description, active)
VALUES ('Agenda Fácil', 'agenda-facil', 'Gestão de Agendamentos', true)
ON CONFLICT (slug) DO NOTHING;

-- 4. Criar assinatura PREENCHENDO TUDO (user_id do seu email)
INSERT INTO public.subscriptions (organization_id, product_id, user_id, status, plan_type)
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Clínica Principal' LIMIT 1),
    (SELECT id FROM public.products WHERE slug = 'agenda-facil' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com'), -- Preenchemos o user_id para garantir
    'active',
    'free'
ON CONFLICT DO NOTHING;

-- 5. Conferência Final
SELECT 
    org.name as clinica, 
    prod.name as produto, 
    sub.status,
    sub.plan_type
FROM public.subscriptions sub
JOIN public.organizations org ON sub.organization_id = org.id
JOIN public.products prod ON sub.product_id = prod.id;
