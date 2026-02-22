-- MASTER FIX SCRIPT (FINAL VERSION V2)
-- 1. Fix allowed Store Types
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS check_store_type;
ALTER TABLE public.shops 
ADD CONSTRAINT check_store_type 
CHECK (store_type IN ('fashion_store_ai', 'mobile_store_ai', 'agenda_facil_ai', 'pet_store_ai', 'other'));

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_user_id UUID;
    v_shop_id UUID;
    v_org_id UUID;
    v_product_id UUID;
BEGIN
    -- 2. Get or Create User
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'medalha25@gmail.com';

    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'medalha25@gmail.com',
            crypt('Clarinha@2019', gen_salt('bf')), now(),
            '{"provider":"email","providers":["email"]}', '{"name":"Admin Medalha"}', now(), now()
        ) RETURNING id INTO v_user_id;
    ELSE
        UPDATE auth.users 
        SET encrypted_password = crypt('Clarinha@2019', gen_salt('bf')), updated_at = now()
        WHERE id = v_user_id;
    END IF;

    -- 3. Ensure Organization Exists
    -- Check if user already has an org linked in profile to reuse
    SELECT organization_id INTO v_org_id FROM public.profiles WHERE id = v_user_id;

    IF v_org_id IS NULL THEN
        -- Check if an org with this slug exists
        SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'clinica-medalha' LIMIT 1;
    END IF;

    IF v_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug)
        VALUES ('Clínica Medalha', 'clinica-medalha')
        RETURNING id INTO v_org_id;
    END IF;

    -- 4. Ensure Organization Member (Role Admin)
    IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = v_org_id AND user_id = v_user_id) THEN
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (v_org_id, v_user_id, 'admin');
    ELSE
        UPDATE public.organization_members 
        SET role = 'admin' 
        WHERE organization_id = v_org_id AND user_id = v_user_id;
    END IF;

    -- 5. Ensure Profile (Role Admin + Org Link)
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
        UPDATE public.profiles 
        SET role = 'admin', 
            name = 'Admin Medalha',
            organization_id = v_org_id
        WHERE id = v_user_id;
    ELSE
        INSERT INTO public.profiles (id, name, role, organization_id) 
        VALUES (v_user_id, 'Admin Medalha', 'admin', v_org_id);
    END IF;

    -- 6. Ensure Shop (Agenda Facil) - Linked to Owner
    SELECT id INTO v_shop_id FROM public.shops WHERE owner_id = v_user_id LIMIT 1;

    IF v_shop_id IS NOT NULL THEN
        UPDATE public.shops 
        SET store_type = 'agenda_facil_ai', plan = 'pro', name = 'Clínica Medalha'
        WHERE id = v_shop_id;
    ELSE
        INSERT INTO public.shops (owner_id, name, slug, store_type, plan)
        VALUES (
            v_user_id, 
            'Clínica Medalha', 
            'clinica-medalha-shop', 
            'agenda_facil_ai', 
            'pro'
        ) RETURNING id INTO v_shop_id;
    END IF;

    -- 7. Ensure Product Exists
    SELECT id INTO v_product_id FROM public.products WHERE slug = 'agenda-facil' LIMIT 1;
    IF v_product_id IS NULL THEN
        INSERT INTO public.products (name, slug, description, price)
        VALUES ('Agenda Fácil', 'agenda-facil', 'Gestão para clínicas', 49.90)
        RETURNING id INTO v_product_id;
    END IF;

    -- 8. Ensure Active Subscription
    DELETE FROM public.subscriptions WHERE user_id = v_user_id;

    INSERT INTO public.subscriptions (
        user_id, organization_id, product_id, product_slug, status, current_period_start, current_period_end
    ) VALUES (
        v_user_id, v_org_id, v_product_id, 'agenda-facil', 'active', now(), now() + interval '1 year'
    );

END $$;
