-- SCRIPT CORRIGIDO FINAL: CRIAR ORGANIZAÇÃO E VINCULAR USUÁRIO
-- A coluna 'slug' não existe, então removemos do insert.

-- 1. Criar uma organização de exemplo
INSERT INTO public.organizations (name, plan_type)
VALUES ('Clínica Principal', 'free')
ON CONFLICT DO NOTHING;

-- 2. Vincular o usuário a essa organização
-- SUBSTITUA 'SEU_EMAIL_AQUI' PELO SEU E-MAIL REAL ABAIXO
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 
    (SELECT id FROM public.organizations WHERE name = 'Clínica Principal' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_AQUI'), -- DIGITE SEU EMAIL AQUI
    'owner'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. Verificação
SELECT * FROM public.organization_members 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_AQUI');
