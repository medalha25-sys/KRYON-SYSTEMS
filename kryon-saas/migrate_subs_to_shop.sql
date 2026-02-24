-- MIGRATE SUBSCRIPTIONS TO SHOP-CENTRIC ARCHITECTURE
-- This ensures the subscriptions table matches the new logic in actions.ts

DO $$ 
BEGIN
    -- 1. Add shop_id to subscriptions if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='shop_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
    END IF;

    -- 2. Backfill shop_id from shops table (link via owner_id/user_id)
    -- This assumes 1 shop per user for the migration phase
    UPDATE public.subscriptions s
    SET shop_id = sh.id
    FROM public.shops sh
    WHERE s.user_id = sh.owner_id AND s.shop_id IS NULL;

    RAISE NOTICE 'Subscriptions table migrated to shop-centric successfully.';
END $$;
