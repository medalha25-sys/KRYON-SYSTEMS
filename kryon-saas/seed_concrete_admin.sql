-- MASTER RECOVERY SCRIPT (v4)
-- This script is extremely aggressive to ensure you can login.
-- It uses UPSERT to handle missing rows and DYNAMIC SQL for schema changes.

DO $$
DECLARE
    v_user_email TEXT := 'medalha25@gmail.com';
    v_user_id UUID;
    v_org_id UUID;
    v_product_id UUID;
    v_product_slug TEXT := 'concrete-erp';
    v_org_name TEXT := 'Concrete ERP Brasil';
    v_org_slug TEXT := 'concrete-erp-main';
BEGIN
    -- 1. Find User ID (Case Insensitive)
    SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(v_user_email);

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'USUÁRIO % NÃO ENCONTRADO NO AUTH.USERS. Verifique o e-mail exato.', v_user_email;
    END IF;

    -- 2. Ensure Schema Columns Exist (Dynamic execution)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='slug') THEN
        EXECUTE 'ALTER TABLE organizations ADD COLUMN slug TEXT UNIQUE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_super_admin') THEN
        EXECUTE 'ALTER TABLE public.profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='organization_id') THEN
        EXECUTE 'ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id)';
    END IF;

    -- 3. Ensure Organization Exists
    INSERT INTO organizations (name, slug)
    VALUES (v_org_name, v_org_slug)
    ON CONFLICT (slug) DO UPDATE SET name = v_org_name
    RETURNING id INTO v_org_id;

    IF v_org_id IS NULL THEN
        SELECT id INTO v_org_id FROM organizations WHERE slug = v_org_slug;
    END IF;

    -- 4. Ensure Profile Exists (Garante que a linha exista antes do UPDATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
        INSERT INTO public.profiles (id, organization_id, role, full_name, is_super_admin)
        VALUES (v_user_id, v_org_id, 'admin', 'Administrador ERP', TRUE)
        ON CONFLICT (id) DO UPDATE SET 
            organization_id = v_org_id,
            role = 'admin',
            full_name = 'Administrador ERP',
            is_super_admin = TRUE;
    ELSE
        INSERT INTO public.profiles (id, organization_id, role, name, is_super_admin)
        VALUES (v_user_id, v_org_id, 'admin', 'Administrador ERP', TRUE)
        ON CONFLICT (id) DO UPDATE SET 
            organization_id = v_org_id,
            role = 'admin',
            name = 'Administrador ERP',
            is_super_admin = TRUE;
    END IF;

    -- 5. Ensure Organization Membership
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (v_org_id, v_user_id, 'admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';

    -- 6. Ensure Product & Subscription
    INSERT INTO products (slug, name, active)
    VALUES (v_product_slug, 'Concrete ERP Brasil', true)
    ON CONFLICT (slug) DO UPDATE SET active = true
    RETURNING id INTO v_product_id;

    IF v_product_id IS NULL THEN
        SELECT id INTO v_product_id FROM products WHERE slug = v_product_slug;
    END IF;

    -- Clear and recreate subscription to be 100% sure
    DELETE FROM public.subscriptions WHERE organization_id = v_org_id AND product_slug = v_product_slug;
    
    INSERT INTO public.subscriptions (user_id, organization_id, product_id, product_slug, status, current_period_end)
    VALUES (v_user_id, v_org_id, v_product_id, v_product_slug, 'trial', NOW() + INTERVAL '30 days');

    RAISE NOTICE 'RECUPERAÇÃO CONCLUÍDA: Usuário % agora é Super Admin com acesso ao %', v_user_email, v_org_name;
END $$;
