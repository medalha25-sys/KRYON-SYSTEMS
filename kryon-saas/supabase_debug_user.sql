-- Inspect User Data for Debugging
SELECT 
    u.email,
    s.name as shop_name,
    s.store_type,
    s.slug as shop_slug,
    sub.status as sub_status,
    sub.product_slug as sub_product_slug,
    p.slug as product_slug_col,
    p.name as product_name
FROM auth.users u
LEFT JOIN public.shops s ON s.owner_id = u.id
LEFT JOIN public.subscriptions sub ON sub.organization_id = s.id
LEFT JOIN public.products p ON sub.product_id = p.id
WHERE u.email = 'medalha25@gmail.com';
