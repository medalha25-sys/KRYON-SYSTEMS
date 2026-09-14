-- ==============================================================================
-- KRYON SYSTEMS — SETUP DEFINITIVO DE FIXTURES MULTITENANT (100% COMPATÍVEL RLS V5.1)
-- BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
-- DATA: 05/09/2026
-- ESCOPO: Inserção de Fixtures Determinísticas A/B (100% tenant_id, zero shop_id)
-- STATUS: AGUARDANDO AUTORIZAÇÃO EXPRESSA (NÃO EXECUTAR AUTOMATICAMENTE)
-- ==============================================================================

DO $$
DECLARE
    -- 1. Constantes determinísticas das identidades e fixtures
    c_email_a CONSTANT TEXT := 'teste_salinas_a@kryonsystems.internal';
    c_email_b CONSTANT TEXT := 'teste_estetica_b@kryonsystems.internal';
    c_expected_user_a_id CONSTANT UUID := '9e3f3003-08ac-4ee5-98fa-71a918fa16b5'::uuid;
    c_expected_user_b_id CONSTANT UUID := '703d459c-b371-4d51-a9d2-c5e9e210eeae'::uuid;

    v_user_a_id UUID;
    v_user_b_id UUID;
    v_org_a_id UUID := 'a1111111-1111-1111-1111-111111111111'::uuid;
    v_org_b_id UUID := 'b2222222-2222-2222-2222-222222222222'::uuid;
    v_slug_a CONSTANT TEXT := 'teste-lava-rapido-salinas-a';
    v_slug_b CONSTANT TEXT := 'teste-estetica-automotiva-vip-b';
    v_serv_a_id UUID := 'a3333333-3333-3333-3333-333333333333'::uuid;
    v_serv_b_id UUID := 'b4444444-4444-4444-4444-444444444444'::uuid;
    v_cust_a_id UUID := 'a5555555-5555-5555-5555-555555555555'::uuid;
    v_cust_b_id UUID := 'b6666666-6666-6666-6666-666666666666'::uuid;
    v_appt_a_id UUID := 'a7777777-7777-7777-7777-777777777777'::uuid;
    v_appt_b_id UUID := 'b8888888-8888-8888-8888-888888888888'::uuid;

    -- Variáveis de controle e validação
    v_count_admin INTEGER;
    v_count_prof_a INTEGER;
    v_count_prof_b INTEGER;
    v_val_orgs INTEGER;
    v_val_members INTEGER;
    v_val_services INTEGER;
    v_val_customers INTEGER;
    v_val_appointments INTEGER;
    v_prof_a_org UUID;
    v_prof_b_org UUID;
BEGIN
    -- -------------------------------------------------------------------------
    -- FASE 1: VALIDAÇÃO PRÉVIA DE IDENTIDADES (AUTH.USERS E PROFILES EXISTENTES)
    -- -------------------------------------------------------------------------
    
    -- 1.1 Localizar e validar User A
    SELECT id INTO v_user_a_id FROM auth.users WHERE lower(email) = lower(c_email_a);
    IF v_user_a_id IS NULL THEN
        RAISE EXCEPTION 'FALHA DE PRÉ-REQUISITO: Usuário A (%) não encontrado em auth.users.', c_email_a;
    END IF;
    IF v_user_a_id != c_expected_user_a_id THEN
        RAISE EXCEPTION 'DIVERGÊNCIA DE IDENTIDADE: User A possui UUID % em vez do esperado %.', v_user_a_id, c_expected_user_a_id;
    END IF;

    -- 1.2 Localizar e validar User B
    SELECT id INTO v_user_b_id FROM auth.users WHERE lower(email) = lower(c_email_b);
    IF v_user_b_id IS NULL THEN
        RAISE EXCEPTION 'FALHA DE PRÉ-REQUISITO: Usuário B (%) não encontrado em auth.users.', c_email_b;
    END IF;
    IF v_user_b_id != c_expected_user_b_id THEN
        RAISE EXCEPTION 'DIVERGÊNCIA DE IDENTIDADE: User B possui UUID % em vez do esperado %.', v_user_b_id, c_expected_user_b_id;
    END IF;

    -- 1.3 Validar que profiles dos usuários de teste já existem e têm is_super_admin = false
    SELECT COUNT(*) INTO v_count_prof_a FROM public.profiles WHERE id = v_user_a_id AND is_super_admin = false;
    IF v_count_prof_a != 1 THEN
        RAISE EXCEPTION 'FALHA DE PRÉ-REQUISITO: Profile do User A (%) não existe ou possui is_super_admin inválido.', v_user_a_id;
    END IF;

    SELECT COUNT(*) INTO v_count_prof_b FROM public.profiles WHERE id = v_user_b_id AND is_super_admin = false;
    IF v_count_prof_b != 1 THEN
        RAISE EXCEPTION 'FALHA DE PRÉ-REQUISITO: Profile do User B (%) não existe ou possui is_super_admin inválido.', v_user_b_id;
    END IF;

    -- 1.4 Validar preservação e integridade do Super Admin (medalha25@gmail.com)
    SELECT COUNT(*) INTO v_count_admin 
    FROM public.profiles 
    WHERE is_super_admin = true AND id = 'd6902e70-ba2e-4aa7-ab77-727d59fd41ec'::uuid;
    IF v_count_admin != 1 THEN
        RAISE EXCEPTION 'ALERTA DE SEGURANÇA: Super Admin não encontrado ou desconfigurado.';
    END IF;

    -- -------------------------------------------------------------------------
    -- FASE 2: LIMPEZA SEGURA E CIRÚRGICA DE FIXTURES PRÉVIAS (IDEMPOTÊNCIA TOTAL)
    -- -------------------------------------------------------------------------
    -- Remove exclusivamente os IDs determinísticos de teste para evitar erro de PK duplicada
    DELETE FROM public.appointments WHERE id IN (v_appt_a_id, v_appt_b_id) OR tenant_id IN (v_org_a_id, v_org_b_id);
    DELETE FROM public.customers WHERE id IN (v_cust_a_id, v_cust_b_id) OR tenant_id IN (v_org_a_id, v_org_b_id);
    DELETE FROM public.services WHERE id IN (v_serv_a_id, v_serv_b_id) OR tenant_id IN (v_org_a_id, v_org_b_id);
    DELETE FROM public.organization_members WHERE organization_id IN (v_org_a_id, v_org_b_id);
    DELETE FROM public.organizations WHERE id IN (v_org_a_id, v_org_b_id) OR lower(slug) IN (lower(v_slug_a), lower(v_slug_b));

    -- -------------------------------------------------------------------------
    -- FASE 3: INSERÇÕES DETERMINÍSTICAS DAS FIXTURES (SCHEMA COMPATÍVEL V5.1)
    -- -------------------------------------------------------------------------

    -- 3.1 Organizações de Teste (Trigger on_organization_owner_created gera owner em organization_members)
    INSERT INTO public.organizations (id, name, slug, phone, address, owner_id, status)
    VALUES 
        (v_org_a_id, '[TESTE] Lava Rápido Salinas A', v_slug_a, '(38) 99999-0001', 'Rua A, 100 - Salinas', v_user_a_id, 'active'),
        (v_org_b_id, '[TESTE] Estética Automotiva VIP B', v_slug_b, '(38) 99999-0002', 'Av B, 200 - Salinas', v_user_b_id, 'active');

    -- 3.2 Garantir organization_members (Caso o trigger não esteja habilitado ou para garantia idempotente)
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES 
        (v_org_a_id, v_user_a_id, 'owner'),
        (v_org_b_id, v_user_b_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner';

    -- 3.3 Garantir vínculo em profiles.organization_id
    UPDATE public.profiles SET organization_id = v_org_a_id WHERE id = v_user_a_id;
    UPDATE public.profiles SET organization_id = v_org_b_id WHERE id = v_user_b_id;

    -- 3.4 Serviços Distintos (tenant_id NOT NULL)
    INSERT INTO public.services (id, tenant_id, name, vehicle_type, price, duration_minutes, is_active)
    VALUES 
        (v_serv_a_id, v_org_a_id, '[TESTE] Lavagem Completa A', 'CARRO', 50.00, 45, true),
        (v_serv_b_id, v_org_b_id, '[TESTE] Polimento Premium B', 'CARRO', 150.00, 90, true);

    -- 3.5 Clientes Distintos (100% tenant_id, ZERO shop_id, tenant_id NOT NULL)
    INSERT INTO public.customers (id, tenant_id, name, phone, cpf, vehicle_plate, vehicle_model, notes, points)
    VALUES 
        (v_cust_a_id, v_org_a_id, '[TESTE] Cliente Salinas A', '(38) 98888-0001', '111.111.111-11', 'ABC1A01', 'Sedan Médio', 'Cliente frequente', 10),
        (v_cust_b_id, v_org_b_id, '[TESTE] Cliente VIP B', '(38) 98888-0002', '222.222.222-22', 'XYZ9Z99', 'SUV Luxo', 'Cliente premium', 25);

    -- 3.6 Agendamentos Distintos (tenant_id NOT NULL)
    INSERT INTO public.appointments (id, tenant_id, service_id, customer_name, customer_phone, vehicle_plate, scheduled_at, status, total_price)
    VALUES 
        (v_appt_a_id, v_org_a_id, v_serv_a_id, '[TESTE] Cliente Salinas A', '(38) 98888-0001', 'ABC1A01', now() + interval '1 day', 'PENDENTE', 50.00),
        (v_appt_b_id, v_org_b_id, v_serv_b_id, '[TESTE] Cliente VIP B', '(38) 98888-0002', 'XYZ9Z99', now() + interval '2 day', 'PENDENTE', 150.00);

    -- -------------------------------------------------------------------------
    -- FASE 4: VALIDAÇÃO PÓS-SETUP E AUDITORIA DE INTEGRIDADE
    -- -------------------------------------------------------------------------

    -- 4.1 Validar exatamente 2 organizações
    SELECT COUNT(*) INTO v_val_orgs FROM public.organizations WHERE id IN (v_org_a_id, v_org_b_id);
    IF v_val_orgs != 2 THEN
        RAISE EXCEPTION 'ERRO PÓS-SETUP: Esperava 2 organizações, foram encontradas %.', v_val_orgs;
    END IF;

    -- 4.2 Validar exatamente 2 membros (owner)
    SELECT COUNT(*) INTO v_val_members 
    FROM public.organization_members 
    WHERE organization_id IN (v_org_a_id, v_org_b_id) AND user_id IN (v_user_a_id, v_user_b_id) AND role = 'owner';
    IF v_val_members != 2 THEN
        RAISE EXCEPTION 'ERRO PÓS-SETUP: Esperava 2 organization_members, foram encontrados %.', v_val_members;
    END IF;

    -- 4.3 Validar profiles vinculados
    SELECT organization_id INTO v_prof_a_org FROM public.profiles WHERE id = v_user_a_id;
    SELECT organization_id INTO v_prof_b_org FROM public.profiles WHERE id = v_user_b_id;
    IF v_prof_a_org != v_org_a_id OR v_prof_b_org != v_org_b_id THEN
        RAISE EXCEPTION 'ERRO PÓS-SETUP: profiles.organization_id divergente das organizações de teste.';
    END IF;

    -- 4.4 Validar exatamente 2 serviços
    SELECT COUNT(*) INTO v_val_services FROM public.services WHERE id IN (v_serv_a_id, v_serv_b_id);
    IF v_val_services != 2 THEN
        RAISE EXCEPTION 'ERRO PÓS-SETUP: Esperava 2 serviços, foram encontrados %.', v_val_services;
    END IF;

    -- 4.5 Validar exatamente 2 clientes
    SELECT COUNT(*) INTO v_val_customers FROM public.customers WHERE id IN (v_cust_a_id, v_cust_b_id);
    IF v_val_customers != 2 THEN
        RAISE EXCEPTION 'ERRO PÓS-SETUP: Esperava 2 clientes, foram encontrados %.', v_val_customers;
    END IF;

    -- 4.6 Validar exatamente 2 agendamentos
    SELECT COUNT(*) INTO v_val_appointments FROM public.appointments WHERE id IN (v_appt_a_id, v_appt_b_id);
    IF v_val_appointments != 2 THEN
        RAISE EXCEPTION 'ERRO PÓS-SETUP: Esperava 2 agendamentos, foram encontrados %.', v_val_appointments;
    END IF;

    RAISE NOTICE '======================================================================';
    RAISE NOTICE 'SUCESSO: Setup de Fixtures A/B V5.1 concluído e auditado!';
    RAISE NOTICE 'Org A (%) vinculada ao User A (%)', v_org_a_id, v_user_a_id;
    RAISE NOTICE 'Org B (%) vinculada ao User B (%)', v_org_b_id, v_user_b_id;
    RAISE NOTICE 'Entidades: 2 Orgs, 2 Members, 2 Services, 2 Customers, 2 Appointments.';
    RAISE NOTICE '======================================================================';
END $$;
