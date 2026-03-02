-- SCRIPT PARA CORRIGIR RECURSÃO NO RLS DO SUPABASE
-- Execute este script no SQL Editor do seu Dashboard Supabase

-- 1. Criar função auxiliar com SECURITY DEFINER para checar Super Admin sem causar recursão
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atualizar as políticas da tabela de Perfis
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.profiles;

CREATE POLICY "Super Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_super_admin());

-- 3. Garantir que o usuário atual tenha permissão de acesso básico (caso a recursão tenha quebrado tudo)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 4. Re-aplicar flag de Super Admin para seu usuário principal
UPDATE public.profiles
SET is_super_admin = TRUE, role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('elisagelaramalhosouza@gmail.com', 'medalha25@gmail.com')
);
