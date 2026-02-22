SELECT 
    u.email,
    s.status,
    s.valid_until,
    p.name as product_name,
    p.slug as product_slug
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
LEFT JOIN public.products p ON s.product_id = p.id
WHERE u.email = 'medalha25@gmail.com';
