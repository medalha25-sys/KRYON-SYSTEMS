-- SUPER FIX: Forçar vínculo e assinatura para o administrador
-- Este script garante que o usuário medalha25 esteja vinculado à organização correta e tenha a assinatura ativa.

DO $$
DECLARE
    target_user_id UUID := '99166f36-9b59-408d-8a9d-ead7d97686d'; -- Use o ID do usuário medalha25
    target_org_id UUID;
    target_prod_id UUID;
BEGIN
    -- 1. Tentar encontrar a organização dele
    SELECT organization_id INTO target_org_id FROM public.profiles WHERE id = target_user_id;
    
    -- Se não tiver org, pegar a primeira disponível ou criar (ajuste conforme necessário)
    IF target_org_id IS NULL THEN
        SELECT id INTO target_org_id FROM public.organizations LIMIT 1;
        UPDATE public.profiles SET organization_id = target_org_id WHERE id = target_user_id;
    END IF;

    -- 2. Garantir que o produto concrete-erp existe
    INSERT INTO public.products (name, slug, description, active)
    VALUES ('Concrete ERP', 'concrete-erp', 'Sistema de gestão de concreteiras.', true)
    ON CONFLICT (slug) DO NOTHING;
    
    SELECT id INTO target_prod_id FROM public.products WHERE slug = 'concrete-erp';

    -- 3. Forçar criação/atualização da assinatura trial
    DELETE FROM public.subscriptions WHERE organization_id = target_org_id AND product_slug = 'concrete-erp';
    
    INSERT INTO public.subscriptions (
        organization_id, 
        user_id, 
        product_slug, 
        status, 
        plan_type, 
        product_id,
        current_period_end
    ) VALUES (
        target_org_id,
        target_user_id,
        'concrete-erp',
        'trial',
        'free',
        target_prod_id,
        (now() + interval '30 days')
    );
    
    RAISE NOTICE 'Fix concluído para Org: %', target_org_id;
END $$;
