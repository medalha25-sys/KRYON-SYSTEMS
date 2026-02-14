-- ATUALIZAÇÃO DA FUNÇÃO DE ADMIN
-- Usa tabela auth.users como base para garantir que todos usuários apareçam
-- mesmo se não tiverem profile

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
SECURITY DEFINER -- Roda com privilegios de superusuario da função
SET search_path = public, auth -- Acesso ao schema auth
AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id,
    au.email::VARCHAR,
    COALESCE(p.name, 'Usuário sem Nome') as name,
    COALESCE(s.name, 'Sem Loja') as shop_name,
    NULL::TEXT as shop_cnpj,
    au.created_at as joined_at,
    COALESCE(sub.status, 'inactive') as sub_status,
    COALESCE(sub.product_slug, '-') as sub_product
  FROM
    auth.users au
  LEFT JOIN
    public.profiles p ON p.id = au.id
  LEFT JOIN
    public.shops s ON s.owner_id = au.id
  LEFT JOIN
    public.subscriptions sub ON sub.user_id = au.id
  ORDER BY
    au.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Garante permissões
GRANT EXECUTE ON FUNCTION public.get_admin_users_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users_data() TO service_role;
