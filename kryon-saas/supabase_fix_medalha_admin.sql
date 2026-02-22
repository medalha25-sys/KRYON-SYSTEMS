-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    user_id UUID;
    shop_id UUID;
    product_id UUID;
BEGIN
    -- 1. Check if user exists or create them
    SELECT id INTO user_id FROM auth.users WHERE email = 'medalha25@gmail.com';

    IF user_id IS NULL THEN
        -- Create new user
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'medalha25@gmail.com',
            crypt('123456', gen_salt('bf')), -- Password: 123456
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Admin Medalha"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO user_id;
    ELSE
        -- Update existing user password
        UPDATE auth.users 
        SET encrypted_password = crypt('123456', gen_salt('bf')),
            updated_at = now()
        WHERE id = user_id;
    END IF;

    -- 2. Ensure Profile exists
    -- Remove 'email' column from insert as it might not exist in profiles
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
        UPDATE public.profiles SET role = 'admin' WHERE id = user_id;
    ELSE
        INSERT INTO public.profiles (id, name, role)
        VALUES (user_id, 'Admin Medalha', 'admin');
    END IF;

    -- 3. Ensure Shop exists (Agenda Facil Type)
    SELECT id INTO shop_id FROM public.shops WHERE owner_id = user_id LIMIT 1;

    IF shop_id IS NOT NULL THEN
        UPDATE public.shops 
        SET store_type = 'agenda_facil_ai',
            plan = 'pro'
        WHERE id = shop_id;
    ELSE
        INSERT INTO public.shops (owner_id, name, slug, store_type, plan)
        VALUES (
            user_id, 
            'Clínica Medalha', 
            'clinica-medalha-' || substr(md5(random()::text), 1, 4), 
            'agenda_facil_ai', 
            'pro'
        ) RETURNING id INTO shop_id;
    END IF;

    -- 4. Get Product ID for Agenda Facil
    SELECT id INTO product_id FROM public.products WHERE slug = 'agenda-facil' LIMIT 1;
    
    -- If product doesn't exist, create it (bootstrap safe)
    IF product_id IS NULL THEN
        INSERT INTO public.products (name, slug, description, price)
        VALUES ('Agenda Fácil', 'agenda-facil', 'Gestão completa para clínicas', 49.90)
        RETURNING id INTO product_id;
    END IF;

    -- 5. Ensure Subscription exists and is ACTIVE
    -- Delete old invalid subs to be clean
    DELETE FROM public.subscriptions WHERE user_id = user_id AND product_slug != 'agenda-facil';

    IF EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = user_id AND product_slug = 'agenda-facil') THEN
        UPDATE public.subscriptions
        SET status = 'active', 
            current_period_end = now() + interval '1 year',
            organization_id = shop_id
        WHERE user_id = user_id AND product_slug = 'agenda-facil';
    ELSE
        INSERT INTO public.subscriptions (
            user_id, 
            organization_id, 
            product_id, 
            product_slug, 
            status, 
            current_period_start, 
            current_period_end
        )
        VALUES (
            user_id, 
            shop_id, 
            product_id, 
            'agenda-facil', 
            'active', 
            now(), 
            now() + interval '1 year'
        );
    END IF;

    -- 6. Link to Profiles Organization ID
    UPDATE public.profiles 
    SET organization_id = shop_id 
    WHERE id = user_id;

END $$;
