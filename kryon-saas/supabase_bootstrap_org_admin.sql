-- SCRIPT CORRIGIDO (ROLE 'admin')

-- 1. Criar organização
INSERT INTO public.organizations (name, plan_type)
VALUES ('Clínica Principal', 'free')
ON CONFLICT DO NOTHING;

-- 2. Vincular usuário (medalha25@gmail.com) com role 'admin'
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Clínica Principal' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com'),
    'admin' -- ALTERADO DE 'owner' PARA 'admin'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. Confirmar
SELECT * FROM public.organization_members 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com');
