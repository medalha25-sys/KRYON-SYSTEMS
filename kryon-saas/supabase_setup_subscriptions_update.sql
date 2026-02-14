-- Update subscriptions table to include stats fields
-- Do not drop table, just add columns safely

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;

-- Optional: Update existing rows if price is null (example default)
-- UPDATE public.subscriptions SET price = 97.00 WHERE price IS NULL;
