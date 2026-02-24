-- EMERGENCY ACCESS FIX: CONCRETE ERP + SCHEMA RECOVERY
-- Targets user: medalha25@gmail.com

DO $$ 
DECLARE
    target_user_id UUID;
    target_org_id UUID;
    concrete_prod_id UUID;
BEGIN
    -- 0. SCHEMA RECOVERY: Ensure columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_super_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='modules') THEN
        ALTER TABLE public.organizations ADD COLUMN modules JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 1. Identify User
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'medalha25@gmail.com';
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User medalha25@gmail.com not found in auth.users';
        RETURN;
    END IF;

    -- 2. Ensure Profile is Super Admin and has an Org
    UPDATE public.profiles 
    SET is_super_admin = true, 
        role = 'admin'
    WHERE id = target_user_id;

    SELECT organization_id INTO target_org_id FROM public.profiles WHERE id = target_user_id;

    -- 3. Ensure Organization exists if user has none
    IF target_org_id IS NULL THEN
        -- Try to find any existing org first to link
        SELECT id INTO target_org_id FROM public.organizations LIMIT 1;
        
        IF target_org_id IS NULL THEN
            INSERT INTO public.organizations (name, slug)
            VALUES ('Kryon Systems', 'kryon-systems')
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id INTO target_org_id;
        END IF;

        UPDATE public.profiles SET organization_id = target_org_id WHERE id = target_user_id;
        
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (target_org_id, target_user_id, 'owner')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. Enable Modules for the Org
    UPDATE public.organizations 
    SET modules = COALESCE(modules, '{}'::jsonb) || '{"concrete_erp": true, "agenda_facil": true, "fiscal": true, "financeiro": true}'::jsonb
    WHERE id = target_org_id;

    -- 5. Ensure Product "concrete-erp" exists
    INSERT INTO public.products (name, slug, description, active)
    VALUES ('Concrete ERP', 'concrete-erp', 'Sistema de Gestão Industrial', true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, active = true
    RETURNING id INTO concrete_prod_id;

    -- 6. Create/Update Active Subscription (Using DELETE+INSERT for robustness)
    DELETE FROM public.subscriptions 
    WHERE organization_id = target_org_id AND product_id = concrete_prod_id;

    INSERT INTO public.subscriptions (organization_id, product_id, product_slug, status, plan_type, current_period_end)
    VALUES (
        target_org_id, 
        concrete_prod_id, 
        'concrete-erp', 
        'active', 
        'pro', 
        (now() + interval '1 year')
    );

    -- Legacy support (if table has user_id)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='user_id') THEN
        UPDATE public.subscriptions 
        SET user_id = target_user_id 
        WHERE organization_id = target_org_id AND product_id = concrete_prod_id;
    END IF;

    RAISE NOTICE 'Access fixed successfully for user medalha25@gmail.com';
END $$;
