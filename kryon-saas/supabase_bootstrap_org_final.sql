-- SCRIPT COM EMAIL DEFINIDO: CRIAR ORGANIZAÇÃO E VINCULAR USUÁRIO

-- 1. Criar organização
INSERT INTO public.organizations (name, plan_type)
VALUES ('Clínica Principal', 'free')
ON CONFLICT DO NOTHING;

-- 2. Vincular usuário (medalha25@gmail.com)
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Clínica Principal' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com'),
    'owner'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. Confirmar se funcionou
SELECT * FROM public.organization_members 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com');
