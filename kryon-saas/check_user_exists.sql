-- check_user_exists.sql
-- Run this to check if the user and profile are in the system

DO $$
DECLARE
    v_email TEXT := 'papaleguaslavajato2026@gmail.com';
    v_user_id UUID;
    v_profile_exists BOOLEAN;
    v_shop_exists BOOLEAN;
BEGIN
    -- Check auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE '>>> ALERTA: O usuário % NÃO existe na tabela auth.users.', v_email;
        RAISE NOTICE '>>> AÇÃO: O cliente precisa clicar em "Criar conta agora" na tela de login primeiro.';
    ELSE
        RAISE NOTICE '>>> SUCESSO: Usuário % encontrado com ID %', v_email, v_user_id;
        
        -- Check public.profiles
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = v_user_id) INTO v_profile_exists;
        IF v_profile_exists THEN
            RAISE NOTICE '>>> Perfil encontrado na tabela public.profiles.';
        ELSE
            RAISE NOTICE '>>> ALERTA: Perfil NÃO encontrado na tabela public.profiles.';
        END IF;

        -- Check public.shops
        SELECT EXISTS(SELECT 1 FROM public.shops WHERE owner_id = v_user_id) INTO v_shop_exists;
        IF v_shop_exists THEN
            RAISE NOTICE '>>> Loja (Shop) encontrada para este usuário.';
        ELSE
            RAISE NOTICE '>>> ALERTA: Nenhuma loja encontrada para este usuário.';
        END IF;
    END IF;
END $$;
