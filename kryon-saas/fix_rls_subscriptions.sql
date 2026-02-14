-- Allow users to insert their own subscriptions (e.g., trial)
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Also good to have UPDATE policy if needed later
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);
