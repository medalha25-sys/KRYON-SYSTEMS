-- Notification Logs Table to prevent duplicate emails
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'trial_welcome', 'trial_tips', 'trial_ending', 'trial_expired', 'upgrade_confirmed'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_logs_lookup ON public.notification_logs(user_id, subscription_id, type);

-- RLS (Admin only or Server Side mostly, but good practice)
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications? Maybe not needed yet, but safe default:
CREATE POLICY "Users can view own notifications" 
ON public.notification_logs FOR SELECT 
USING (auth.uid() = user_id);
