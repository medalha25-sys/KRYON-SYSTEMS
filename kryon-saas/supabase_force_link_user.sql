-- Link a user to an organization manually
-- Replace 'seu@email.com' with your actual login email

INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 
    org.id,
    u.id,
    'owner'
FROM public.organizations org
CROSS JOIN auth.users u
WHERE u.email = 'seu@email.com' -- DIGITE SEU EMAIL AQUI
LIMIT 1
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Verifique se funcionou
SELECT * FROM public.organization_members 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu@email.com');
