-- SCRIPT: CRIAR PRODUTO E ASSINATURA

-- 1. Criar o produto "Agenda Fácil" se não existir
INSERT INTO public.products (name, slug, description, active)
VALUES ('Agenda Fácil', 'agenda-facil', 'Gestão de Agendamentos e Clínicas', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Criar uma assinatura ATIVA para a "Clínica Principal"
INSERT INTO public.subscriptions (organization_id, product_id, status, plan_type)
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Clínica Principal' LIMIT 1),
    (SELECT id FROM public.products WHERE slug = 'agenda-facil' LIMIT 1),
    'active',
    'free'
ON CONFLICT DO NOTHING;

-- 3. Verificação
SELECT 
    org.name as clinica, 
    prod.name as produto, 
    sub.status 
FROM public.subscriptions sub
JOIN public.organizations org ON sub.organization_id = org.id
JOIN public.products prod ON sub.product_id = prod.id;
