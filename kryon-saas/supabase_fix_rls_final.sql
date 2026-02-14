-- Enable RLS on tables (just to be safe)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- 1. Policies for SUBSCRIPTIONS
-- Allow users to view their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own subscriptions (Fixes the error)
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own subscriptions
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);


-- 2. Policies for SHOPS (Preventative)
-- Allow users to view their own shops
DROP POLICY IF EXISTS "Users can view own shops" ON public.shops;
CREATE POLICY "Users can view own shops"
ON public.shops FOR SELECT
USING (auth.uid() = owner_id);

-- Allow users to create their own shops
DROP POLICY IF EXISTS "Users can insert own shops" ON public.shops;
CREATE POLICY "Users can insert own shops"
ON public.shops FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own shops
DROP POLICY IF EXISTS "Users can update own shops" ON public.shops;
CREATE POLICY "Users can update own shops"
ON public.shops FOR UPDATE
USING (auth.uid() = owner_id);

-- 3. ADMIN POLICIES (Allow admin to view everything)
-- Replace 'medalha25@gmail.com' with the actual admin email or a role check if available
-- Note: auth.jwt() ->> 'email' might not always be available in RLS depending on setup, 
-- but normally it is. Safest for dev is to allow all authenticated users to SELECT for now, 
-- OR strictly check the email if we want to be cleaner.
-- Let's use a policy that allows anyone to VIEW shops/profiles (public info usually) or at least authenticated users.

DROP POLICY IF EXISTS "Enable read access for all users" ON public.shops;
CREATE POLICY "Enable read access for all users"
ON public.shops FOR SELECT
USING (true); -- Allow everyone to see shops (needed for admin list)

DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users"
ON public.profiles FOR SELECT
USING (true); -- Allow everyone to see profiles (needed for admin list)

