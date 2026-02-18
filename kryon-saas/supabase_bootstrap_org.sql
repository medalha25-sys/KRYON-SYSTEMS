-- SCRIPT CORRIGIDO: CRIAR ORGANIZAÇÃO E VINCULAR USUÁRIO

-- 1. Criar uma organização de exemplo (já que não existe nenhuma)
INSERT INTO public.organizations (name, slug, typo, logo_url)
VALUES ('Clínica Principal', 'clinica-principal', 'fisica', null)
ON CONFLICT DO NOTHING;

-- 2. Vincular o usuário a essa organização criada
-- SUBSTITUA 'SEU_EMAIL_AQUI' PELO SEU E-MAIL REAL NO SUPABASE
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 
    (SELECT id FROM public.organizations WHERE slug = 'clinica-principal' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_AQUI'), -- DIGITE SEU EMAIL AQUI
    'owner'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. Confirmar se deu certo
SELECT * FROM public.organization_members 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_AQUI');
