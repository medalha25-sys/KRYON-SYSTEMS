-- 20240601000001_setup_triggers.sql
-- Setup Triggers and Backfill Data

-- 1. Create Function to Handle New User
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- 1. Create a default Organization for the user (One user = One Org model for now)
    INSERT INTO public.organizations (name, slug)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'organization_name', 'Minha Clínica'),
        extensions.uuid_generate_v4()::text -- Temporary slug
    )
    RETURNING id INTO org_id;

    -- 2. Create Profile linked to Org
    INSERT INTO public.profiles (id, full_name, avatar_url, role, organization_id)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        'admin', -- First user of org is admin
        org_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill for Existing Users (Migration Fix)
-- This block is safe to run multiple times (idempotent-ish)

DO $$
DECLARE
    r RECORD;
    org_id UUID;
BEGIN
    FOR r IN SELECT * FROM auth.users LOOP
        -- Check if profile exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = r.id) THEN
            -- Create Org
            INSERT INTO public.organizations (name)
            VALUES ('Clínica ' || COALESCE(r.email, 'Usuário'))
            RETURNING id INTO org_id;

            -- Create Profile
            INSERT INTO public.profiles (id, organization_id, role, full_name)
            VALUES (
                r.id,
                org_id,
                'admin', -- Existing users get admin of their own clinic
                COALESCE(r.raw_user_meta_data->>'full_name', r.email)
            );
        END IF;
    END LOOP;
END;
$$;
