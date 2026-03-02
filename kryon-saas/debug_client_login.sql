-- SCRIPT PARA INVESTIGAR PROBLEMA DE LOGIN DO CLIENTE (VERSÃO CORRIGIDA)
-- Execute este script no SQL Editor do seu Dashboard Supabase

-- 1. Buscar o ID do usuário pelo e-mail na tabela de autenticação e verificar o perfil
SELECT 
    au.id as auth_id,
    au.email,
    p.name, 
    p.role, 
    p.is_super_admin, 
    p.organization_id, 
    p.shop_id,
    s.name as shop_name,
    s.store_type as shop_type
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.shops s ON p.shop_id = s.id OR p.id = s.owner_id
WHERE au.email = 'trabalharamires@gmail.com';

-- 2. Verificar se existe uma assinatura ativa para este usuário ou sua organização
SELECT 
    sub.id as subscription_id,
    sub.status,
    sub.current_period_end,
    prod.slug as product_slug,
    sub.organization_id,
    sub.shop_id
FROM public.subscriptions sub
LEFT JOIN public.products prod ON sub.product_id = prod.id
WHERE sub.user_id IN (SELECT id FROM auth.users WHERE email = 'trabalharamires@gmail.com')
   OR sub.organization_id IN (
       SELECT organization_id FROM public.profiles p 
       JOIN auth.users au ON p.id = au.id 
       WHERE au.email = 'trabalharamires@gmail.com'
   );

-- NOTA: Se o primeiro comando não retornar nada, significa que o usuário não existe no Auth.
-- Se o campo 'organization_id' ou 'shop_id' estiverem nulos, o vínculo está quebrado.
