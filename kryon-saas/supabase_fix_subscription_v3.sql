-- SCRIPT MESTRE V3: CORREÇÃO DEFINITIVA (product_slug)

-- 1. Relaxar restrições antigas (product_slug e user_id)
-- Para evitar erros futuros, vamos deixar essas colunas opcionais
ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN product_slug DROP NOT NULL;

-- 2. Garantir colunas novas
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';

-- 3. Inserir Produto
INSERT INTO public.products (name, slug, description, active)
VALUES ('Agenda Fácil', 'agenda-facil', 'Gestão de Agendamentos', true)
ON CONFLICT (slug) DO NOTHING;

-- 4. Inserir Assinatura COMPLETA (com product_slug para garantir)
INSERT INTO public.subscriptions (
    organization_id, 
    product_id, 
    user_id, 
    status, 
    plan_type, 
    product_slug -- << Coluna antiga ainda exigida pelo banco
)
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Clínica Principal' LIMIT 1),
    (SELECT id FROM public.products WHERE slug = 'agenda-facil' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com'),
    'active',
    'free',
    'agenda-facil' -- << Valor legado para compatibilidade
ON CONFLICT DO NOTHING;

-- 5. Conferência
SELECT id, status, plan_type, product_slug FROM public.subscriptions 
WHERE organization_id = (SELECT id FROM public.organizations WHERE name = 'Clínica Principal' LIMIT 1);
