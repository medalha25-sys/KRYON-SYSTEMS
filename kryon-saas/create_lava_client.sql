-- create_lava_client.sql
-- 1. Create User, Organization, Shop and Subscription for Papa Léguas Lava Jato

DO $$
DECLARE
    v_user_id UUID;
    v_shop_id UUID;
    v_org_id UUID;
    v_product_id UUID;
    v_email TEXT := 'papalegualavajato2026@gmail.com';
    v_password TEXT := '123456';
    v_org_name TEXT := 'Papa Léguas Lava Jato';
    v_org_slug TEXT := 'papa-leguas-lava-jato';
BEGIN
    -- 0. Update Store Type constraint if needed
    ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS check_store_type;
    ALTER TABLE public.shops 
    ADD CONSTRAINT check_store_type 
    CHECK (store_type IN ('fashion_store_ai', 'mobile_store_ai', 'agenda_facil_ai', 'pet_store_ai', 'lava_rapido', 'concrete_erp', 'industrial', 'other'));

    -- 1. Get or Create User
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email,
            crypt(v_password, gen_salt('bf')), now(),
            '{"provider":"email","providers":["email"]}', jsonb_build_object('name', v_org_name), now(), now()
        ) RETURNING id INTO v_user_id;
    ELSE
        UPDATE auth.users 
        SET encrypted_password = crypt(v_password, gen_salt('bf')), updated_at = now()
        WHERE id = v_user_id;
    END IF;

    -- 2. Ensure Organization Exists
    SELECT id INTO v_org_id FROM public.organizations WHERE slug = v_org_slug LIMIT 1;

    IF v_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug)
        VALUES (v_org_name, v_org_slug)
        RETURNING id INTO v_org_id;
    END IF;

    -- 3. Ensure Organization Member (Role Admin)
    IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = v_org_id AND user_id = v_user_id) THEN
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (v_org_id, v_user_id, 'admin');
    ELSE
        UPDATE public.organization_members 
        SET role = 'admin' 
        WHERE organization_id = v_org_id AND user_id = v_user_id;
    END IF;

    -- 4. Ensure Profile (Role Admin + Org Link)
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
        UPDATE public.profiles 
        SET role = 'admin', 
            name = v_org_name,
            organization_id = v_org_id
        WHERE id = v_user_id;
    ELSE
        INSERT INTO public.profiles (id, name, role, organization_id) 
        VALUES (v_user_id, v_org_name, 'admin', v_org_id);
    END IF;

    -- 5. Ensure Shop (Lava Jato) - Linked to Owner
    SELECT id INTO v_shop_id FROM public.shops WHERE owner_id = v_user_id LIMIT 1;

    IF v_shop_id IS NOT NULL THEN
        UPDATE public.shops 
        SET store_type = 'lava_rapido', plan = 'pro', name = v_org_name
        WHERE id = v_shop_id;
    ELSE
        INSERT INTO public.shops (owner_id, name, slug, store_type, plan)
        VALUES (
            v_user_id, 
            v_org_name, 
            v_org_slug || '-' || substr(v_user_id::text, 1, 4), 
            'lava_rapido', 
            'pro'
        ) RETURNING id INTO v_shop_id;
    END IF;

    -- 6. Ensure Subscription exists for Lava Rápido
    SELECT id INTO v_product_id FROM public.products WHERE slug = 'lava-rapido' LIMIT 1;
    
    IF v_product_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.subscriptions 
            WHERE organization_id = v_org_id AND product_id = v_product_id
        ) THEN
            INSERT INTO public.subscriptions (
                organization_id, product_id, product_slug, status, current_period_end
            ) VALUES (
                v_org_id, v_product_id, 'lava-rapido', 'active', now() + interval '1 year'
            );
        ELSE
            UPDATE public.subscriptions 
            SET status = 'active', 
                current_period_end = now() + interval '1 year'
            WHERE organization_id = v_org_id AND product_id = v_product_id;
        END IF;
    END IF;

END $$;
