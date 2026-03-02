-- SCRIPT PARA GARANTIR ACESSO EXCLUSIVO E DEFINITIVO AO CONCRETE ERP (Múltiplas Grafias)
-- Este script limpa conflitos, ATUALIZA CONSTRAINTS e ativa o módulo.

-- 0. CORREÇÃO DE CONSTRAINT (IMPORTANTE)
-- O banco de dados bloqueia certos store_types. Vamos liberar o Concrete ERP e Industrial.
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS check_store_type;
ALTER TABLE public.shops 
ADD CONSTRAINT check_store_type 
CHECK (store_type IN ('fashion_store_ai', 'mobile_store_ai', 'agenda_facil_ai', 'pet_store_ai', 'concrete_erp', 'industrial', 'other'));

DO $$
DECLARE
    -- Lista de e-mails para processar (caso haja confusão na grafia)
    v_emails TEXT[] := ARRAY['trabalhoramiris@gmail.com', 'trabalhoramires@gmail.com', 'trabalharamires@gmail.com'];
    v_email TEXT;
    v_user_id UUID;
    v_org_id UUID;
    v_product_id UUID;
BEGIN
    FOREACH v_email IN ARRAY v_emails LOOP
        -- 1. Buscar ID do usuário
        SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
        
        IF v_user_id IS NOT NULL THEN
            RAISE NOTICE 'Processando usuário: %', v_email;

            -- 2. Limpeza AGRESSIVA: Remover TODAS as assinaturas vinculadas a este usuário diretamente
            DELETE FROM public.subscriptions WHERE user_id = v_user_id;
            RAISE NOTICE 'Removidas assinaturas diretas.';

            -- 3. Buscar Organização atual
            SELECT organization_id INTO v_org_id FROM public.profiles WHERE id = v_user_id;

            -- 4. Limpar TODAS as assinaturas de TODAS as organizações onde este usuário é membro
            DELETE FROM public.subscriptions 
            WHERE organization_id IN (
                SELECT organization_id FROM public.organization_members WHERE user_id = v_user_id
            );
            RAISE NOTICE 'Removidas assinaturas de organizações vinculadas.';

            -- 5. Garantir que o produto 'concrete-erp' existe
            SELECT id INTO v_product_id FROM public.products WHERE slug = 'concrete-erp';
            IF v_product_id IS NULL THEN
                SELECT id INTO v_product_id FROM public.products WHERE slug = 'industrial'; 
            END IF;
            
            IF v_product_id IS NULL THEN
                INSERT INTO public.products (slug, name, active) VALUES ('concrete-erp', 'Concrete ERP', true)
                RETURNING id INTO v_product_id;
                RAISE NOTICE 'Produto Concrete ERP criado.';
            END IF;

            -- 6. Garantir que o usuário tenha uma organização e perfil configurados
            IF v_org_id IS NULL THEN
                INSERT INTO public.organizations (name, slug) 
                VALUES ('Concrete ERP - Client', 'concrete-client-' || floor(random()*1000)::text)
                RETURNING id INTO v_org_id;
                
                UPDATE public.profiles SET organization_id = v_org_id WHERE id = v_user_id;
                RAISE NOTICE 'Nova organização criada.';
            END IF;

            -- 7. ATIVAR MÓDULO CONCRETE ERP NA ORGANIZAÇÃO
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='modules') THEN
                ALTER TABLE organizations ADD COLUMN modules JSONB DEFAULT '{"concrete_erp": false}'::jsonb;
            END IF;

            UPDATE public.organizations 
            SET modules = jsonb_set(COALESCE(modules, '{}'::jsonb), '{concrete_erp}', 'true')
            WHERE id = v_org_id;
            RAISE NOTICE 'Módulo concrete_erp ativado.';

            -- 8. Adicionar Assinatura EXCLUSIVA
            INSERT INTO public.subscriptions (user_id, organization_id, product_id, product_slug, status, current_period_end)
            VALUES (v_user_id, v_org_id, v_product_id, 'concrete-erp', 'active', NOW() + INTERVAL '1 year');
            RAISE NOTICE 'Assinatura Concrete ERP adicionada.';

            -- 9. Corrigir o Shop (Tipo de Loja)
            UPDATE public.shops 
            SET store_type = 'concrete_erp',
                plan = 'pro',
                name = 'Concrete ERP Store'
            WHERE owner_id = v_user_id OR id = (SELECT shop_id FROM public.profiles WHERE id = v_user_id);
            RAISE NOTICE 'Loja atualizada.';

            RAISE NOTICE '--- SUCESSO PARA % ---', v_email;
        ELSE
            RAISE NOTICE 'E-mail % não encontrado no Supabase Auth.', v_email;
        END IF;
    END LOOP;
END $$;
