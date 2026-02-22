SELECT u.email, p.role, p.organization_id 
FROM auth.users u 
JOIN public.profiles p ON p.id = u.id 
WHERE u.email = 'medalha25@gmail.com';

SELECT * FROM public.organizations 
WHERE id IN (SELECT organization_id FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com'));

SELECT * FROM public.organization_members
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com');

SELECT * FROM public.subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com');

SELECT * FROM public.products;
