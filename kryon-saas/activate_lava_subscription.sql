-- activate_lava_subscription.sql
-- 1. Force the client shop plan to 'pro' and status to 'active'

DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
    v_shop_id UUID;
    v_product_id UUID;
    v_email TEXT := 'papaleguaslavajato2026@gmail.com';
BEGIN
    -- 1. Get User
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuário não encontrado: %', v_email;
        RETURN;
    END IF;

    -- 2. Get Organization
    SELECT organization_id INTO v_org_id FROM public.profiles WHERE id = v_user_id;
    
    -- 3. Get Shop
    SELECT id INTO v_shop_id FROM public.shops WHERE owner_id = v_user_id LIMIT 1;

    -- 4. Get Product ID for Lava Rápido
    SELECT id INTO v_product_id FROM public.products WHERE slug = 'lava-rapido' LIMIT 1;

    -- 5. Force Shop Plan to 'pro' (Crucial for middleware bypass)
    IF v_shop_id IS NOT NULL THEN
        UPDATE public.shops 
        SET plan = 'pro', 
            store_type = 'lava_rapido'
        WHERE id = v_shop_id;
        RAISE NOTICE 'Plano da loja atualizado para PRO.';
    ELSE
        RAISE NOTICE 'Loja não encontrada para este usuário.';
    END IF;

    -- 6. Force Subscription Status to 'active'
    IF v_org_id IS NOT NULL AND v_product_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.subscriptions WHERE organization_id = v_org_id AND product_id = v_product_id) THEN
            UPDATE public.subscriptions 
            SET status = 'active', 
                current_period_end = now() + interval '1 year'
            WHERE organization_id = v_org_id AND product_id = v_product_id;
            RAISE NOTICE 'Assinatura existente atualizada para ATIVA.';
        ELSE
            INSERT INTO public.subscriptions (organization_id, product_id, product_slug, status, current_period_end)
            VALUES (v_org_id, v_product_id, 'lava-rapido', 'active', now() + interval '1 year');
            RAISE NOTICE 'Nova assinatura ativa criada.';
        END IF;
    ELSE
        RAISE NOTICE 'Erro: Organização ou Produto não encontrados.';
    END IF;

    RAISE NOTICE 'SUCESSO: Assinatura ativada para %', v_email;
END $$;
