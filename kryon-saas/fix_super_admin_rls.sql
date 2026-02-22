-- 1. Permite que o usuário veja sua própria coluna is_super_admin
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
);

-- 2. Permite update para o próprio usuário (necessário para onboardings as vezes)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id
);

-- 3. Garante que Super Admins vejam TUDO
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.profiles;

CREATE POLICY "Super Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (SELECT p.is_super_admin FROM public.profiles p WHERE p.id = auth.uid()) = true
);

-- REFORÇO: Garante que seu usuário é admin
UPDATE public.profiles
SET is_super_admin = TRUE, role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'elisagelaramalhosouza@gmail.com'
);
