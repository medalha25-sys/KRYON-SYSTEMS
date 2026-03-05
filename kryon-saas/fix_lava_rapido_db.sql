-- 1. Remover o "(Em Breve)" do nome do produto no landing page
UPDATE public.products 
SET name = 'Agendamento Online' 
WHERE slug = 'lava-rapido';

-- 2. Corrigir o store_type da loja do cliente para garantir o redirecionamento correto
-- Isso garante que o middleware envie o usuário para /products/lava-rapido e não para agenda-facil
UPDATE public.shops
SET store_type = 'lava_rapido'
WHERE id IN (
  SELECT shop_id 
  FROM public.profiles 
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'papaleguaslavajato2026@gmail.com'
  )
);

-- 3. Garantir que o produto na assinatura também esteja correto
UPDATE public.subscriptions
SET product_slug = 'lava-rapido'
WHERE organization_id IN (
  SELECT organization_id 
  FROM public.profiles 
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'papaleguaslavajato2026@gmail.com'
  )
) AND product_slug = 'agenda-facil';
