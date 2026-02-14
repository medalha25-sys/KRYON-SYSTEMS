-- FUNÇÃO PARA O ADMIN BUSCAR TODOS OS USUÁRIOS
-- Resolve o problema de RLS e da coluna de email que não existe na tabela profiles
CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  name TEXT,
  shop_name TEXT,
  shop_cnpj TEXT,
  joined_at TIMESTAMPTZ,
  sub_status TEXT,
  sub_product TEXT
) 
SECURITY DEFINER -- Roda como admin, ignorando RLS
SET search_path = public, auth -- Garante acesso ao schema auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    au.email::VARCHAR, -- Cast para garantir o tipo
    p.name,
    s.name as shop_name,
    NULL::TEXT as shop_cnpj, -- CNPJ removido da query simples se não existir na tabela shops
    p.created_at as joined_at,
    sub.status as sub_status,
    sub.product_slug as sub_product
  FROM 
    public.profiles p
  JOIN 
    auth.users au ON p.id = au.id
  LEFT JOIN 
    public.shops s ON s.owner_id = p.id
  LEFT JOIN 
    public.subscriptions sub ON sub.user_id = p.id AND sub.status IN ('active', 'trial', 'trialing')
  ORDER BY 
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Garante que o usuário autenticado possa chamar a função
GRANT EXECUTE ON FUNCTION public.get_admin_users_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users_data() TO service_role;
